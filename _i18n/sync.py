"""Одна команда, чтобы украинская, немецкая и английская версии voznesenskaya.ch оставались зеркалом русской.
Запуск из корня репозитория:
  python3 _i18n/sync.py check          — пересобрать всё, что уже переведено, и записать непереведённое в _i18n/todo.json
  python3 _i18n/sync.py apply FILE     — принять переводы из FILE ({"<i>": {"uk": …, "de": …, "en": …}}), проверить, пересобрать
  python3 _i18n/sync.py build          — только пересобрать (ошибка, если чего-то не хватает)
Подробности — _i18n/README.md, правила перевода и глоссарий — _i18n/RULES.md."""
import sys, os, re, json
sys.path.insert(0, os.path.dirname(__file__))
import pages, tests
ROOT = tests.ROOT; I18N = tests.I18N; LANGS = tests.LANGS
KNOWN_DIRS = {'put', 'uk', 'de', 'en', 'home', 'rabota', 'assets', '_i18n'} | set(tests.TESTS)

def new_pages():
    """русские страницы, для которых ещё нет механизма перевода"""
    res = []
    for name in sorted(os.listdir(ROOT)):
        p = os.path.join(ROOT, name, 'index.html')
        if name.startswith('.') or name in KNOWN_DIRS or not os.path.exists(p): continue
        s = open(p, encoding='utf-8').read()
        if 'http-equiv="refresh"' in s: continue   # переадресация, не страница
        res.append(name + '/')
    return res

def check():
    pm = pages.build()
    tm, multi, _ = tests.build(check=True)
    todo = []
    seen = set()
    for l in LANGS:
        for u in pm[l]:
            if ('page', u) in seen: continue
            seen.add(('page', u)); todo.append({'ru': u, 'where': 'page', 'ctx': ''})
    for m in tm:
        if ('test', m['ru']) in seen: continue
        seen.add(('test', m['ru'])); todo.append({'ru': m['ru'], 'where': 'test:' + m['where'], 'ctx': m['ctx']})
    for i, t in enumerate(todo): t['i'] = i
    rep = {'units': todo, 'multilingual_blocks_changed': multi, 'new_pages': new_pages()}
    json.dump(rep, open(os.path.join(I18N, 'todo.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if not tm:
        _, _, ch = tests.build()
    print(f"to translate: {len(todo)} units; multilingual blocks changed: {multi or 'none'}; new pages without mirror: {rep['new_pages'] or 'none'}")
    return rep

ATTR = re.compile(r'\b(alt|title|aria-label|placeholder|content|data-tip|data-text|data-lead)\s*=\s*(\\?")(.*?)\2')
def problems(ru, t, l):
    norm = lambda x: ATTR.sub(lambda m: m.group(1) + '=""', x)
    p = []
    if sorted(re.findall(r'⟦\d+⟧', ru)) != sorted(re.findall(r'⟦\d+⟧', t)): p.append('placeholders')
    if [norm(x) for x in re.findall(r'<[^>]+>', ru)] != [norm(x) for x in re.findall(r'<[^>]+>', t)]: p.append('tags')
    if ru[:len(ru) - len(ru.lstrip())] != t[:len(t) - len(t.lstrip())] or ru[len(ru.rstrip()):] != t[len(t.rstrip()):]: p.append('whitespace')
    if l == 'de' and 'ß' in t: p.append('ß')
    if "'" in t and "'" not in ru: p.append('straight apostrophe')
    if l in ('de', 'en'):
        rest = re.sub(r'ВСТРЕЧА|ОТЗЫВ|ЗАЯВКА|РАССЫЛКА|ПОРЯДОК', '', t)
        if tests.CYR.search(re.sub(r'<[^>]+>', '', rest)) and tests.CYR.search(ru) and t != ru: p.append('cyrillic left')
    return p

def apply(path):
    todo = json.load(open(os.path.join(I18N, 'todo.json'), encoding='utf-8'))['units']
    done = json.load(open(path, encoding='utf-8'))
    tmm_p = os.path.join(I18N, 'tm_main.json'); tmt_p = os.path.join(I18N, 'tm_tests.json')
    TMM = json.load(open(tmm_p, encoding='utf-8')); TMT = json.load(open(tmt_p, encoding='utf-8'))
    bad = []
    for t in todo:
        v = done.get(str(t['i']))
        if not v: bad.append((t['i'], 'missing')); continue
        for l in LANGS:
            pr = problems(t['ru'], v.get(l, ''), l)
            if pr: bad.append((t['i'], l, pr))
    if bad:
        print('NOT APPLIED, fix these:', bad[:30]); sys.exit(1)
    for t in todo:
        v = done[str(t['i'])]
        for l in LANGS:
            (TMM if t['where'] == 'page' else TMT)[l][t['ru']] = v[l]
    json.dump(TMM, open(tmm_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(TMT, open(tmt_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)
    print(f'applied {len(todo)} units'); return build()

def build():
    pm = pages.build()
    tm, multi, ch = tests.build()
    left = sum(len(v) for v in pm.values()) + len(tm)
    print(f'built; untranslated left: {left}; multilingual blocks changed: {multi or "none"}; test files changed: {ch}')
    if left: sys.exit(1)

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'check': check()
    elif cmd == 'apply': apply(sys.argv[2])
    elif cmd == 'build': build()
    else: print(__doc__)
