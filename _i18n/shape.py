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
TILES = 'html header.top nav a .pa-ni{display:none}@media (max-width:1100px){html header.top .page{flex-wrap:wrap;row-gap:8px}html header.top nav{order:3;width:100%;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px!important;overflow:visible!important;padding:4px 0 12px!important;margin:0}html header.top nav a{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-height:62px;padding:9px 6px;border-radius:14px;background:var(--paper,#FFFCF8);border:1px solid color-mix(in srgb,var(--brown,#6E4F3C) 22%,transparent);box-shadow:0 3px 10px -6px rgba(80,55,35,.45);color:var(--ink,#2F2924)!important;font:600 .78rem/1.18 var(--body,system-ui);text-align:center;white-space:normal!important;text-decoration:none;-webkit-tap-highlight-color:transparent}html header.top nav a .pa-ni{display:block;width:22px;height:22px;fill:none;stroke:var(--brown,#6E4F3C);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}html header.top nav a[aria-current]:not([aria-current=false]){background:var(--brown,#6E4F3C);border-color:var(--brown,#6E4F3C);color:var(--paper,#FFFCF8)!important}html header.top nav a[aria-current]:not([aria-current=false]) .pa-ni{stroke:var(--paper,#FFFCF8)}html header.top nav a:active{transform:scale(.97)}}'
JS = '(function(){function run(){var n=document.querySelector(\'header.top nav\');if(!n)return;var I={who:\'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.7-3.8 3.4-6 7-6s6.3 2.2 7 6"/>\',req:\'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>\',path:\'<path d="M12 3.5 20.5 8 12 12.5 3.5 8z"/><path d="M3.5 12 12 16.5 20.5 12M3.5 16 12 20.5 20.5 16"/>\',put:\'<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h6"/>\',tests:\'<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="m8.5 9 1.5 1.5L13 7.5M8.5 15l1.5 1.5 3-3M15 9.5h1M15 15.5h1"/>\',svoi:\'<circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="4.5" r="1.8"/><circle cx="12" cy="19.5" r="1.8"/><circle cx="5.5" cy="8.3" r="1.8"/><circle cx="18.5" cy="8.3" r="1.8"/><circle cx="5.5" cy="15.7" r="1.8"/><circle cx="18.5" cy="15.7" r="1.8"/>\'};n.querySelectorAll(\'a\').forEach(function(a){if(a.querySelector(\'.pa-ni\'))return;var h=a.getAttribute(\'href\')||\'\',k=/svoiludi/.test(h)?\'svoi\':/#who/.test(h)?\'who\':/#requests/.test(h)?\'req\':/#path/.test(h)?\'path\':/put\\/?$/.test(h)?\'put\':/testy/.test(h)?\'tests\':null;if(!k)return;a.insertAdjacentHTML(\'afterbegin\',\'<svg class="pa-ni" viewBox="0 0 24 24" aria-hidden="true">\'+I[k]+\'</svg>\');a.style.removeProperty(\'color\');});}if(document.readyState===\'loading\')document.addEventListener(\'DOMContentLoaded\',run);else run();})();'
BLOCK = M + '<style id="shape">' + CSS + TILES + '</style><script>' + JS + '</script>' + M

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
