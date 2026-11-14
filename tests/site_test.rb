require 'minitest/autorun'
require 'yaml'
require 'uri'
require 'cgi'

class SiteTest < Minitest::Test
  def test_catalog_and_resource_targets
    ids = []
    %w[grade9 grade11].each do |grade|
      data = YAML.load_file("_data/#{grade}.yml")
      html = File.read("_site/#{grade == 'grade9' ? 9 : 11}/index.html")
      data['sections'].each do |section|
        section['lessons'].each do |lesson|
          refute_includes ids, lesson['id'], 'Lesson IDs must be globally unique'
          ids << lesson['id']
          if lesson['published']
            assert_includes html, "id=\"#{lesson['id']}\""
            resource_ids = lesson['resources'].map { |r| r['id'] }
            assert_equal resource_ids.uniq, resource_ids
            lesson['resources'].each { |r| assert File.file?("_site#{r['path']}"), r['path'] }
          else
            refute_includes html, lesson['title']
          end
        end
      end
    end
  end

  def test_all_generated_local_links_with_project_baseurl
    count = 0
    Dir['_site/**/*.html'].each do |file|
      html = File.read(file)
      refute_match(/\{%|\{\{/, html, file)
      html.scan(/(?:href|src)="([^"]+)"/).flatten.each do |raw|
        next if raw.start_with?('#', 'https:', 'http:', 'mailto:')
        url = URI.parse(CGI.unescapeHTML(raw))
        if url.path.start_with?('/')
          assert url.path.start_with?('/classroom/'), "Missing baseurl: #{raw}"
          target = "_site#{url.path.delete_prefix('/classroom')}"
        else
          target = File.expand_path(url.path, File.dirname(file))
        end
        target = File.join(target, 'index.html') if File.directory?(target)
        assert File.file?(target), "Broken link #{file}: #{raw}"
        if url.fragment
          assert_includes File.read(target), "id=\"#{url.fragment}\""
        end
        count += 1
      end
    end
    assert_operator count, :>, 50
  end

  def test_markdown_and_standalone_html
    html = File.read('_site/materials/9/cpp-sample-01-theory.html')
    assert_includes html, '<pre'
    assert_includes html, 'Hello, Classroom!'
    assert_equal File.read('standalone/cpp-example.html'), File.read('_site/standalone/cpp-example.html')
    refute File.exist?('_site/tests')
    refute File.exist?('_site/Gemfile')
  end
end
