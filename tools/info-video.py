#!/usr/bin/env python3

import sys, json
from subprocess import run

info = run([ 'yt-dlp', '--skip-download', '-J', sys.argv[1] ], capture_output=True)
info = json.loads(info.stdout)

out = { }

def get(key, newkey=None, f=None):
    val = info.get(key)
    if val is not None:
        out[newkey or key] = val if f is None else f(val)

get('id')
# get('uploader_id', 'channel', lambda x: x.removeprefix('@'))
# get('channel_id', 'channel')
get('channel_url', 'channel')
get('fulltitle', 'title')
# get('description')
get('duration')
get('upload_date', 'uploaded', lambda x: f'{x[:4]}-{x[4:6]}-{x[6:]}')
get('tags')

print(json.dumps(out, indent=2, separators=(',',': ')))
