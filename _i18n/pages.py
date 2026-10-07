"""Сборка языковых версий статических страниц voznesenskaya.ch: /uk/, /de/, /en/ (+ put/).
Запуск из корня репозитория: python3 _i18n/pages.py  — пишет страницы и список непереведённого в _i18n/missing_pages.json"""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(__file__))
from htmlunits import page_units, translate_page
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ['uk', 'de', 'en']
LOCALE = {'ru': 'ru_RU', 'uk': 'uk_UA', 'de': 'de_CH', 'en': 'en_GB'}
LABEL = {'ru': 'RU', 'uk': 'UA', 'de': 'DE', 'en': 'EN'}
PAGES = [('index.html', '/'), ('put/index.html', '/put/')]   # исходник → путь на сайте
TRANSLATED = {p for _, p in PAGES}
KEY = 'irinaTestsLang'   # тот же ключ, что у тестов: выбор языка общий для всего сайта
def tm():
    p = os.path.join(ROOT, '_i18n', 'tm_main.json')
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {l: {} for l in LANGS}
def site_path(base, url):
    """относительную ссылку исходной страницы → абсолютный путь сайта"""
    if re.match(r'^(https?:|mailto:|tel:|data:|#|\$\{|javascript:|/)', url): return None
    parts = base.rstrip('/').split('/')[:-0 or None]
    stack = [x for x in base.split('/') if x]
    for seg in url.split('/'):
        if seg == '..': stack = stack[:-1]
        elif seg in ('', '.'): continue
        else: stack.append(seg)
    if not stack: return '/'
    path = '/' + '/'.join(stack) + ('/' if url.endswith('/') or url in ('.', './', '..', '../') else '')
    return path
TEST_DIRS = ('/testy/', '/kompas/', '/roza-lyubvi/', '/stupeni/', '/blizost/', '/privacy/', '/impressum/')
def localize_url(path, lang, hashpart=''):
    if path in TRANSLATED: return f'/{lang}{path}' + hashpart
    if path in TEST_DIRS and not hashpart: return path + '#lang=' + lang   # страницы с переключателем внутри
    return path + hashpart
def fix_links(html, base, lang):
    def attr(m):
        name, url = m.group(1), m.group(2)
        u, h = (url.split('#', 1) + [''])[:2] if '#' in url else (url, '')
        if url.startswith('#'): return m.group(0)
        sp = site_path(base, u if u else './')
        if sp is None: return m.group(0)
        return f'{name}="{localize_url(sp, lang, ("#" + h) if h else "")}"'
    html = re.sub(r'\b(href|src)="([^"]*)"', attr, html)
    # абсолютные ссылки на свои переведённые страницы и тесты
    def absu(m):
        path = m.group(2) or '/'
        if path in TRANSLATED or path in TEST_DIRS: return m.group(1) + 'https://voznesenskaya.ch' + localize_url(path, lang) + '"'
        return m.group(0)
    html = re.sub(r'(href=")https://voznesenskaya\.ch(/[a-z-]*/?)?"', absu, html)
    # пути к тестам и страницам внутри скриптов: 'kompas/', '../testy/' и т. п.
    def js(m):
        q, url = m.group(1), m.group(2)
        sp = site_path(base, url)
        return q + localize_url(sp, lang) + q
    html = re.sub(r"(['\"])((?:\.\./)*(?:testy|kompas|roza-lyubvi|stupeni|blizost|put|privacy|impressum)/)\1", js, html)
    return html
SWITCH_CSS = '#langbar.langbar{position:fixed;bottom:14px;right:14px;left:auto;top:auto;width:auto;max-width:none;margin:0;z-index:60;display:flex;gap:2px;background:rgba(255,255,255,.92);border:1px solid rgba(0,0,0,.08);border-radius:999px;padding:3px;font:600 12px Manrope,system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.08)}#langbar.langbar a{color:#5d554d;padding:5px 9px;border-radius:999px;text-decoration:none;font:inherit;display:inline-block;width:auto}#langbar.langbar a[aria-current="true"]{background:#2f2924;color:#fff}@media print{.langbar{display:none!important}}'
def switcher(cur, path):
    links = []
    for l in ['ru'] + LANGS:
        href = path if l == 'ru' else f'/{l}{path}'
        links.append(f'<a href="{href}" hreflang="{l}" data-lang="{l}"{" aria-current=\"true\"" if l == cur else ""}>{LABEL[l]}</a>')
    js = ("<script>(function(){var b=document.getElementById('langbar');if(!b)return;b.addEventListener('click',function(e){var a=e.target.closest('a[data-lang]');"
          f"if(a)try{{localStorage.setItem('{KEY}',a.dataset.lang)}}catch(x){{}}}});}})();</script>")
    return f'<style>{SWITCH_CSS}</style><div class="langbar" id="langbar" role="navigation" aria-label="Language">' + ''.join(links) + '</div>' + js
def redirect_js(path):
    """на русской странице: если человек раньше выбрал другой язык, открыть его версию"""
    return ("<script>(function(){try{var l=localStorage.getItem('" + KEY + "');if(l&&l!=='ru'&&['uk','de','en'].indexOf(l)>=0&&!/[?&]lang=ru/.test(location.search))"
            "location.replace('/'+l+'" + path + "'+location.hash);}catch(e){}})();</script>")
def alternates(path):
    s = f'<link rel="alternate" hreflang="ru" href="https://voznesenskaya.ch{path}">'
    for l in LANGS: s += f'<link rel="alternate" hreflang="{l}" href="https://voznesenskaya.ch/{l}{path}">'
    return s
def head_inject(html, extra):
    return html.replace('</head>', extra + '</head>', 1)
def body_inject(html, extra):
    i = html.rfind('</body>'); return html[:i] + extra + html[i:]
from units import units_of as js_units, apply as js_apply
from jstok import CYR
def localize_assets(html, lang, TM, missing):
    """общие скрипты с русским текстом (share.js, reviews.js) → assets/имя.{lang}.js"""
    def rep(m):
        name = m.group(2)
        src = os.path.join(ROOT, 'assets', name + '.js')
        code = open(src, encoding='utf-8').read()
        if not js_units(code): return m.group(0)
        tr = TM.get(lang, {}); miss = [u for u in dict.fromkeys(js_units(code)) if u not in tr]
        if miss:
            missing[lang] += [u for u in miss if u not in missing[lang]]; return m.group(0)
        out = js_apply(code, tr)
        out = re.sub(r"https://voznesenskaya\.ch/(put/)?(?=['#])", lambda k: f"https://voznesenskaya.ch/{lang}/" + (k.group(1) or ''), out)
        open(os.path.join(ROOT, 'assets', f'{name}.{lang}.js'), 'w', encoding='utf-8').write(out)
        return f'{m.group(1)}/assets/{name}.{lang}.js"'
    return re.sub(r'(<script src=")/assets/([a-z]+)\.js"', rep, html)
MARK = '<!--i18n-->'
def strip_injected(html):
    return re.sub(re.escape(MARK) + r'.*?' + re.escape(MARK), '', html, flags=re.S)
def build():
    TM = tm(); missing = {l: [] for l in LANGS}
    for src, path in PAGES:
        sp = os.path.join(ROOT, src)
        ru = strip_injected(open(sp, encoding='utf-8').read())
        # русская версия: переключатель, alternate, перенаправление по выбранному языку
        ru_out = head_inject(ru, MARK + alternates(path) + redirect_js(path) + MARK)
        ru_out = body_inject(ru_out, MARK + switcher('ru', path) + MARK)
        open(sp, 'w', encoding='utf-8').write(ru_out)
        units = list(dict.fromkeys(page_units(ru)))
        for l in LANGS:
            tr = TM.get(l, {})
            miss = [u for u in units if u not in tr]
            missing[l] += [u for u in miss if u not in missing[l]]
            if miss: continue
            out = translate_page(ru, tr)
            out = re.sub(r'<html lang="ru"', f'<html lang="{l}"', out, count=1)
            out = out.replace('content="ru_RU"', f'content="{LOCALE[l]}"')
            out = out.replace(f'href="https://voznesenskaya.ch{path}"', f'href="https://voznesenskaya.ch/{l}{path}"')
            out = out.replace(f'content="https://voznesenskaya.ch{path}"', f'content="https://voznesenskaya.ch/{l}{path}"')
            out = out.replace(f'data-url="https://voznesenskaya.ch{path}"', f'data-url="https://voznesenskaya.ch/{l}{path}"')
            out = fix_links(out, path, l)
            # картинка-превью ссылки на языке страницы, если есть (_i18n/og.js): og-image.jpg → og-image.{l}.jpg
            out = re.sub(r'(content="https://voznesenskaya\.ch/)([\w/.-]*?og-image)\.jpg(?=")', lambda m: m.group(1) + m.group(2) + (f'.{l}.jpg' if os.path.exists(os.path.join(ROOT, m.group(2) + f'.{l}.jpg')) else '.jpg'), out)
            out = localize_assets(out, l, TM, missing)
            out = head_inject(out, MARK + alternates(path) + MARK)
            out = body_inject(out, MARK + switcher(l, path) + MARK)
            dst = os.path.join(ROOT, l, src)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            open(dst, 'w', encoding='utf-8').write(out)
    json.dump(missing, open(os.path.join(ROOT, '_i18n', 'missing_pages.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return missing
if __name__ == '__main__':
    m = build()
    print({l: len(v) for l, v in m.items()})
