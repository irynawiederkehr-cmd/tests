"""Form of buttons on voznesenskaya.ch (Irina, 08.10.2026): all buttons are rounded rectangles (12 px, nested toggles 9 px),
same as svoiludi.ch. Small labels (credentials, tags, 'soon', meters) stay round.
Puts a <!--shape-->...<!--shape--> style block into <head> of every Russian source page; pages.py copies it to uk/de/en.
Run: python3 _i18n/shape.py ; check: python3 _i18n/shape.py check"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html', 'put/index.html', '404.html', 'testy/index.html', 'kompas/index.html', 'stupeni/index.html',
         'blizost/index.html', 'roza-lyubvi/index.html', 'privacy/index.html', 'impressum/index.html']
M = '<!--shape-->'
CSS = (':is(.navcta,.btn,.jump a,.pb-price,.go-pill,.rv-prod,.rvs-btn,.shr-btn,.invite-links a,.share-btns button,.share-btns a,'
       '.inv-copy,.inv-btn,.sb-cta,.langbar,#langbar.langbar){border-radius:12px!important}'
       ':is(.langbar button,.langbar a,#langbar.langbar a,.bz-pills button){border-radius:9px!important}')
BLOCK = M + '<style id="shape">' + CSS + '</style>' + M

def apply(h):
    h = re.sub(re.escape(M) + '.*?' + re.escape(M), '', h, flags=re.S)
    i = h.find('<!--i18n-->'); j = h.find('</head>')
    pos = i if 0 <= i < j else j
    return h[:pos] + BLOCK + h[pos:]

if __name__ == '__main__':
    bad = []
    for p in PAGES:
        f = os.path.join(ROOT, p); h = open(f, encoding='utf-8').read()
        if sys.argv[1:] == ['check']:
            if M not in h: bad.append(p)
            continue
        n = apply(h)
        if n != h: open(f, 'w', encoding='utf-8').write(n)
    print(('missing: %s' % bad) if bad else 'ok')
