# Classroom · Teaching Hub

Jekyll сайт с примерни материали за 9. клас (C++) и 11. клас (Java). Разделите са демонстрационни до проверката на програмите на МОН.

## Локална разработка

Изисквания: Ruby 3.1+, Bundler, Node.js 22+ за JS тестовете.

```sh
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --baseurl /classroom
```

Адрес: http://localhost:4000/classroom/. За GitHub project Pages е зададен `baseurl: /classroom`; шаблоните използват `relative_url`.

## Организация

- `_data/grades.yml`: класове и навигация.
- `_data/grade9.yml`, `_data/grade11.yml`: раздели → уроци → ресурси.
- `_data/resource_types.yml`: теория, задачи, домашни, допълнителни материали.
- `_layouts/`, `_includes/`: шаблони за страници, класове, материали и карти.
- `materials/`: Markdown с front matter и постоянен `permalink`.
- `standalone/`: HTML без front matter; копира се без промяна. Връзките към класовете са относителни и работят под `/classroom/`.

Примерен урок:

```yaml
id: cpp-sample-01
published: true
title: Първа програма
description: Кратко описание
resources:
  - id: theory
    type: theory
    path: /materials/9/cpp-sample-01-theory.html
```

ID на урока е глобално уникален и постоянен. ID на ресурс е уникален в урока и също постоянен. Не ги променяй при преименуване или пренареждане: localStorage използва `classroom:v1:<grade_id>:<lesson_id>:<resource_id>`. Отметките са само в браузъра, не се изпращат към сървър и не означават оценка. При блокирано хранилище остават функционални в текущата страница с видимо съобщение.

Само булевото `published: true` включва урок в навигацията и напредъка. Раздели само с чернови се скриват. Скриването не прави файловете частни: не добавяй непубликувани материали в публичните директории. Примерните чернови нямат файлове.

## Проверки

```sh
bundle exec jekyll build --strict_front_matter
bundle exec ruby tests/site_test.rb
node --test tests/progress.test.cjs
```

CI изпълнява същите проверки: ID, филтриране на чернови, локални връзки и котви под project baseurl, Markdown и HTML, съхраняване и възстановяване на напредъка, блокирано хранилище, синхронизация между браузърни раздели и сгъване.

## Публикуване

GitHub Pages **не се активира от тази версия**. Workflow-ът само компилира и тества; няма deploy job или Pages permissions. Първото публикуване изисква одобрение и отделна настройка. Преди merge провери дали в хранилището вече е активирано публикуване от клон.

Навигацията следва идеите от [Challengers](https://github.com/mkvelcheva/challengers), без промени по него. Визуалният прототип не беше достъпен през уеб инструмента; дизайнът следва предоставеното описание.
