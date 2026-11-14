"""Create the review PR using Git's configured credential helper (no token on disk)."""
import argparse
import json
from pathlib import Path
import subprocess
import urllib.error
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--create', action='store_true')
args = parser.parse_args()
credentials = subprocess.run(
    ['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n',
    text=True, capture_output=True, check=True,
).stdout
fields = dict(line.split('=', 1) for line in credentials.splitlines() if '=' in line)
token = fields.get('password')
if not token:
    raise SystemExit('GitHub credential helper returned no usable credential.')

def request(path, payload=None):
    req = urllib.request.Request(
        'https://api.github.com/repos/mkvelcheva/classroom' + path,
        data=None if payload is None else json.dumps(payload).encode(),
        headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json',
                 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'Classroom-review'},
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)

if args.create:
    existing = request('/pulls?state=open&head=mkvelcheva:codex/classroom-foundation')
    if existing:
        print(existing[0]['html_url'])
    else:
        result = request('/pulls', {'title': 'Classroom: Jekyll основа и примерни материали за 9. и 11. клас',
            'head': 'codex/classroom-foundation', 'base': 'main',
            'body': Path('PR.md').read_text(encoding='utf-8')})
        print(result['html_url'])
else:
    repo = request('')
    print(json.dumps({'default_branch': repo['default_branch'], 'has_pages': repo['has_pages']}))
