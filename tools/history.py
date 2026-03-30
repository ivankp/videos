#!/usr/bin/env python3

import json

def get(x, key, *keys):
    try:
        x = x[key]
    except:
        return None
    if x is None:
        return None
    elif keys:
        return get(x, *keys)
    else:
        return x

with open('local/watch-history.json') as f:
    history = json.load(f)

channels = [ 'CppCon' ]

keywords = [ x.casefold() for x in [
    'c++', 'programming', 'Henney'
] ]

for item in history:
    select = lambda: print(f'''\
{ item['title'].split('\n',1)[0].strip() }
{ item['titleUrl'] }
{ get(item, 'subtitles', 0, 'name') }
{ get(item, 'time') }
''')

    channel = get(item, 'subtitles', 0, 'name')

    if channel is not None:
        if 'C++ Weekly' in channel:
            continue

    if channel in channels:
        select()
        continue

    title = item['title'].casefold()

    for keyword in keywords:
        if keyword in title:
            select()
            continue

