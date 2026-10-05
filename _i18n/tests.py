"""Сборка языковых версий тестов voznesenskaya.ch: {test}/uk.js, de.js, en.js из {test}/ru.js.
Запуск из корня репозитория:  python3 _i18n/tests.py         — собрать (падает, если чего-то нет в памяти переводов)
                              python3 _i18n/tests.py --check — только найти непереведённое (пишет _i18n/missing_tests.json)
Память переводов: _i18n/tm_tests.json  {"uk": {ru: перевод}, "de": …, "en": …, "_by_test": {test: {lang: {ru: перевод}}}}
Многоязычные блоки (MULTI) содержат словари для всех языков и копируются как есть; их изменения сверяются со снимком в _i18n/snap/."""
import sys, os, re, json, hashlib
sys.path.insert(0, os.path.dirname(__file__))
from units import apply, units_of
from prep import preprocess
from htmlunits import page_units, translate_page
from jstok import CYR
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
I18N = os.path.join(ROOT, '_i18n')
LANGS = ['uk', 'de', 'en']
TESTS = ['testy', 'kompas', 'roza-lyubvi', 'stupeni', 'blizost', 'privacy', 'impressum']
MULTI = {'testy': [0, 1, 2, 4], 'privacy': [0, 1, 2, 4, 5], 'impressum': [0, 1, 2, 4, 5]}
MULTI_DEFAULT = [0, 2, 4, 7]
TITLES = {
 'kompas': ('Компас адаптації', 'Kompass der Anpassung', 'Adaptation Compass'),
 'roza-lyubvi': ('Троянда кохання', 'Die Rose der Liebe', 'The Rose of Love'),
 'stupeni': ('Сходинки стійкості', 'Stufen der Stabilität', 'Steps of Stability'),
 'blizost': ('Бути поруч і бути собою', 'Nah sein und du selbst bleiben', 'Being close and being yourself'),
}

def read_bundle(path):
    s = open(path, encoding='utf-8').read()
    return json.loads(s[s.index('{'):s.rstrip().rstrip(';').rindex('}') + 1])
def write_bundle(path, obj):
    open(path, 'w', encoding='utf-8').write('window.__BUNDLE = ' + json.dumps(obj, ensure_ascii=False) + ';\n')
def load_tm():
    return json.load(open(os.path.join(I18N, 'tm_tests.json'), encoding='utf-8'))
def tr_for(TM, d, l):
    tr = dict(TM[l]); tr.update(TM.get('_by_test', {}).get(d, {}).get(l, {})); return tr

# ---- правки кода после перевода (то, что зависит от языка не только словами) ----
WANTS = {'uk': ('/^Коучинг/', '/^Психологі/'), 'de': ('/^Coaching/', '/^Psychologie/'), 'en': ('/^Coaching/', '/^Psycholog/')}
STMT = {'kompas': {'uk': '/^Я (сама чи сам )?/', 'en': '/^I /'}, 'roza-lyubvi': {'uk': '/^Я /', 'en': '/^I /'}}
def post(js, d, i, l):
    if i == 3:
        a = "other === 'coach' ? /Коучинг/.test(x) : /Психология/.test(x)"
        if a in js: js = js.replace(a, f"other === 'coach' ? {WANTS[l][0]}.test(x) : {WANTS[l][1]}.test(x)")
        if l == 'de':
            js = js.replace("AUTHOR[other].title.replace(/^./, c => c.toLowerCase())", "AUTHOR[other].title")
    if i == 6 and d in STMT:
        rx = "/^Я (сама или сам )?/" if d == 'kompas' else "/^Я /"
        if l == 'de':
            for pat in [f"t.replace({rx}, '').replace(/^./, c => c.toUpperCase())", f"t.replace({rx},'').replace(/^./, c => c.toUpperCase())"]:
                js = js.replace(pat, 't')
            js = js.replace('.toLowerCase()', '')
        else:
            js = js.replace(rx, STMT[d][l])
    if i == 6 and d in ('stupeni', 'blizost'):
        if l == 'de':   # в немецком существительные с большой буквы; цвет ступени — прилагательное
            js = js.replace('.color.toLowerCase()', '.color.__LC__()').replace('.toLowerCase()', '').replace('.__LC__()', '.toLowerCase()')
        if l == 'en':
            for a in ['${GR[strong].toLowerCase()}', '${GR[r.weak].toLowerCase()}']:
                js = js.replace(a, a.replace('.toLowerCase()', ''))
            js = js.replace("const nm = k => `«${LV[k].name}»`;", "const nm = k => `“${LV[k].name}”`;")
        if d == 'blizost':
            CC = {'uk': ('Швейцарія', 'Україна'), 'de': ('Schweiz', 'Ukraine'), 'en': ('Switzerland', 'Ukraine')}[l]
            for ru, t in zip(('Швейцария', 'Украина'), CC):
                js = js.replace("rows.push(['%s'," % ru, "rows.push(['%s'," % t)
    if l == 'en':
        js = js.replace("const kq = s => `«${s}»`", "const kq = s => `“${s}”`").replace("const rq = s => `«${s}»`", "const rq = s => `“${s}”`")
    return js

def post_body(html, d, l):
    if l == 'de': html = html.replace('>E-mail: <span data-legal="email">', '>E-Mail: <span data-legal="email">')
    return html

def snap_path(d, i): return os.path.join(I18N, 'snap', f'{d}.{i}.js')
def build(check=False):
    TM = load_tm()
    missing = []     # {'ru', 'where', 'ctx'}
    multi_changed = []
    out = {}
    for d in TESTS:
        ru = read_bundle(os.path.join(ROOT, d, 'ru.js'))
        multi = MULTI.get(d, MULTI_DEFAULT)
        for i in multi:
            p = snap_path(d, i)
            if not os.path.exists(p) or open(p, encoding='utf-8').read() != ru['scripts'][i]:
                multi_changed.append(f'{d}.{i}')
        for l in LANGS:
            tr = tr_for(TM, d, l)
            sc = []
            for i, c in enumerate(ru['scripts']):
                if i in multi: sc.append(c); continue
                src = preprocess(d, i, c)
                miss = [u for u in units_of(src) if u not in tr]
                for u in miss:
                    if not any(m['ru'] == u for m in missing):
                        k = src.find(u[:40].split('⟦')[0]) if u[:40].split('⟦')[0] else -1
                        missing.append({'ru': u, 'where': f'{d}:{i}', 'ctx': src[max(0, k - 200):k + len(u) + 200] if k >= 0 else ''})
                if miss: sc.append(None); continue
                sc.append(post(apply(src, tr), d, i, l))
            bmiss = [u for u in page_units(ru['body']) if u not in tr]
            for u in bmiss:
                if not any(m['ru'] == u for m in missing): missing.append({'ru': u, 'where': f'{d}:body', 'ctx': ''})
            if not bmiss and None not in sc:
                out[(d, l)] = {'body': post_body(translate_page(ru['body'], tr), d, l), 'scripts': sc}
    json.dump({'missing': missing, 'multi_changed': multi_changed}, open(os.path.join(I18N, 'missing_tests.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if check or missing: return missing, multi_changed, False
    changed = []
    for (d, l), obj in out.items():
        p = os.path.join(ROOT, d, f'{l}.js')
        old = read_bundle(p) if os.path.exists(p) else None
        if old != obj: write_bundle(p, obj); changed.append(f'{d}/{l}.js')
    # версия кэша и заголовки вкладок
    h = hashlib.md5(b''.join(open(os.path.join(ROOT, d, f'{l}.js'), 'rb').read() for d in TESTS for l in ['ru'] + LANGS)).hexdigest()[:8]
    for d in TESTS:
        p = os.path.join(ROOT, d, 'index.html'); s = open(p, encoding='utf-8').read(); s0 = s
        s = re.sub(r'\.js\?v=[0-9a-f]{8}', '.js?v=' + h, s)
        s = s.replace('var LANGS = ["ru"]', 'var LANGS = ["ru", "uk", "de", "en"]')
        if s != s0: open(p, 'w', encoding='utf-8').write(s); changed.append(f'{d}/index.html')
    return missing, multi_changed, changed

def ack_multi():
    os.makedirs(os.path.join(I18N, 'snap'), exist_ok=True)
    for d in TESTS:
        ru = read_bundle(os.path.join(ROOT, d, 'ru.js'))
        for i in MULTI.get(d, MULTI_DEFAULT):
            open(snap_path(d, i), 'w', encoding='utf-8').write(ru['scripts'][i])

if __name__ == '__main__':
    if '--ack-multi' in sys.argv: ack_multi(); print('snapshots updated'); sys.exit()
    m, mc, ch = build(check='--check' in sys.argv)
    print(f'missing units: {len(m)}; multilingual blocks changed since last sync: {mc or "none"}; files changed: {ch if ch is not False else "(not built)"}')
    sys.exit(1 if m else 0)
