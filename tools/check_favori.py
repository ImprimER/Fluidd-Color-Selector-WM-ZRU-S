from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote
import re

class Link(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a' and ('class', 'bookmark') in attrs:
            self.hrefs.append(dict(attrs)['href'])

root = Path(__file__).resolve().parents[1]
source = (root / 'src/favori_couleurs_fluidd.js').read_text(encoding='utf-8')
page = (root / 'dist/Installer_favori_couleurs_Fluidd.html').read_text(encoding='utf-8')
link = Link(); link.feed(page)
assert len(link.hrefs) == 2
assert all(href.startswith('javascript:') and unquote(href[11:]) == source for href in link.hrefs)
assert 'Firefox, Chrome, and Edge' in page
assert '<section lang="en" hidden>' in page
gcode = (root / 'tests/fixtures/orca_tail_4.txt').read_text(encoding='utf-8')
colors = re.search(r'^;\s*filament_colour\s*=\s*(.+)$', gcode, re.I | re.M).group(1).strip().split(';')
used = [float(x) for x in re.search(r'^;\s*filament used \[mm\]\s*=\s*(.+)$', gcode, re.I | re.M).group(1).strip().split(',')]
assert colors == ['#FFFF71','#008000','#000000','#FFFFFF']
assert len(used) == 4 and all(x > 0 for x in used)
print('Favori intact; quatre couleurs et outils reconnus dans le G-code original.')
