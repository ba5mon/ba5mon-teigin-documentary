"""Fetch OFL subsets from Google Fonts into fonts/ (Latin + the punctuation and Japanese used on screen)."""
import re, urllib.parse, urllib.request, os, sys
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
latin = ''.join(chr(c) for c in range(32, 127)) + ''.join(chr(c) for c in range(0xA0, 0x180))
extra = '≈–—‘’“”…·•→←↑↓×✓✗¥°′″№§€½⅓¼'
jp = '帝銀事件國国銀行椎名町支店厚生省医学博士松井蔚平沢貞通東京都豊島区小樽登戸研究所哈爾浜部隊北海道池袋目白新宿上野神田号外自供'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
JOBS = [('sans400', 'Noto Sans:wght@400', latin + extra), ('sans600', 'Noto Sans:wght@600', latin + extra), ('sans700', 'Noto Sans:wght@700', latin + extra),
        ('mono400', 'IBM Plex Mono:wght@400', latin + extra), ('mono600', 'IBM Plex Mono:wght@600', latin + extra),
        ('serifi', 'Source Serif 4:ital,wght@1,400', latin + extra), ('jp700', 'Noto Sans JP:wght@700', jp + '・')]
os.makedirs(os.path.join(D, 'fonts'), exist_ok=True)
for name, fam, chars in JOBS:
    url = 'https://fonts.googleapis.com/css2?' + urllib.parse.urlencode({'family': fam, 'text': chars, 'display': 'block'})
    css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60).read().decode()
    urls = re.findall(r'url\((https://[^)]+)\)', css)
    if not urls: sys.exit(f'no font url for {fam}')
    data = urllib.request.urlopen(urllib.request.Request(urls[0], headers={'User-Agent': UA}), timeout=60).read()
    open(os.path.join(D, f'fonts/{name}.woff2'), 'wb').write(data); print(name, len(data), 'bytes', len(urls), 'part(s)')
