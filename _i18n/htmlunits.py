"""Единицы перевода для статических страниц: текст HTML (с инлайн-тегами), атрибуты и строки во встроенных скриптах."""
import re
from jstok import tokenize as js_tokenize, CYR
from units import units_of as js_units, apply as js_apply
INLINE = {'a','b','i','em','strong','span','small','u','br','sup','sub','mark','s','abbr','code','q','wbr','svg-skip'}
TRANS_ATTRS = None  # все атрибуты с кириллицей
TAG_RE = re.compile(r'<!--.*?-->|<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<[^>]+>', re.S)
def segments(html):
    """[('tag'|'text'|'script'|'style'|'comment', str)]"""
    out = []; pos = 0
    for m in TAG_RE.finditer(html):
        if m.start() > pos: out.append(('text', html[pos:m.start()]))
        t = m.group(0)
        if t.startswith('<!--'): out.append(('comment', t))
        elif t[:7].lower() == '<script': out.append(('script', t))
        elif t[:6].lower() == '<style': out.append(('style', t))
        else: out.append(('tag', t))
        pos = m.end()
    if pos < len(html): out.append(('text', html[pos:]))
    return out
def tagname(t):
    m = re.match(r'</?\s*([a-zA-Z0-9-]+)', t); return m.group(1).lower() if m else ''
ATTR_RE = re.compile(r'(\s[\w:-]+)="([^"]*)"')
def attr_units(tag):
    return [v for a, v in ATTR_RE.findall(tag) if CYR.search(v)]
def runs(html):
    """группирует подряд идущие text и инлайн-теги в «прогоны»; возвращает список (start_idx, end_idx) по segments"""
    segs = segments(html); res = []; cur = None
    for i, (k, v) in enumerate(segs):
        inline = (k == 'text') or (k == 'tag' and tagname(v) in INLINE)
        if inline:
            if cur is None: cur = [i, i]
            else: cur[1] = i
        else:
            if cur: res.append(tuple(cur)); cur = None
    if cur: res.append(tuple(cur))
    return segs, res
def run_text(segs, a, b): return ''.join(segs[k][1] for k in range(a, b + 1))
def page_units(html):
    segs, rs = runs(html); U = []
    for a, b in rs:
        t = run_text(segs, a, b).strip()
        if CYR.search(re.sub(r'<[^>]+>', '', t)): U.append(t)
    for k, v in segs:
        if k == 'tag' and tagname(v) not in INLINE: U += attr_units(v)
        if k == 'tag' and tagname(v) in INLINE: pass  # атрибуты инлайн-тегов переводятся внутри прогона
        if k == 'script':
            body = re.sub(r'^<script\b[^>]*>|</script>$', '', v)
            if CYR.search(body): U += js_units(body)
    return U
def translate_page(html, tr):
    segs, rs = runs(html)
    out = [v for k, v in segs]
    in_run = {}
    for a, b in rs:
        raw = run_text(segs, a, b); t = raw.strip()
        if CYR.search(re.sub(r'<[^>]+>', '', t)):
            lead = raw[:len(raw) - len(raw.lstrip())]; tail = raw[len(raw.rstrip()):]
            out[a] = lead + tr[t] + tail
            for k in range(a + 1, b + 1): out[k] = ''
    for i, (k, v) in enumerate(segs):
        if k == 'tag' and tagname(v) not in INLINE and attr_units(v):
            out[i] = ATTR_RE.sub(lambda m: m.group(1) + '="' + (tr[m.group(2)].replace('"', '&quot;') if CYR.search(m.group(2)) else m.group(2)) + '"', v)
        if k == 'script':
            m = re.match(r'^(<script\b[^>]*>)(.*)(</script>)$', v, re.S)
            if m and CYR.search(m.group(2)): out[i] = m.group(1) + js_apply(m.group(2), tr) + m.group(3)
    return ''.join(out)
