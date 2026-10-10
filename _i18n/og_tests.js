// Превью ссылок тестов (og:image 1200×630): веер страниц разбора справа, слева название.
// Запуск: NODE_PATH=$(npm root -g) node _i18n/og_tests.js [stupeni|testy|…]
// Картинки страниц берутся из {тест}/preview/1–6.jpg (русские) — пересобрать после обновления примеров разбора.
// Тесты открываются на всех языках по одному адресу, поэтому превью одно, русское (так было и раньше).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const P = (t, n) => `file://${ROOT}/${t}/preview/${n}.jpg`;
const CARDS = {
  stupeni: { eb: 'ТЕСТ ИРИНЫ ВОЗНЕСЕНСКОЙ', h: 'Ступени устойчивости', p: 'Чтобы стать своей и чувствовать себя в новой стране как дома.',
    pill: 'Бесплатно · 20 минут · путеводитель и тест', pages: [P('stupeni', 1), P('stupeni', 2), P('stupeni', 3)] },
  testy: { eb: 'ТЕСТЫ ИРИНЫ ВОЗНЕСЕНСКОЙ', h: 'Бесплатные тесты для жизни в новой стране', p: '10–20 минут, а в конце подробный разбор на русском.',
    pill: 'Бесплатно · 4 теста', pages: [P('kompas', 1), P('stupeni', 1), P('blizost', 1), P('roza-lyubvi', 1)] },
};
function html(c) {
  const n = c.pages.length, four = n === 4;
  const rot = four ? [-12, -5, 2, 8] : [-9, -2, 5], W = four ? 218 : 236, dx = four ? 98 : 118, x0 = four ? 660 : 735;
  const fan = c.pages.map((src, i) => `<img src="${src}" style="width:${W}px;height:${Math.round(W * 1.413)}px;left:${x0 + i * dx}px;top:${(four ? 150 : 120) - i * 10}px;transform:rotate(${rot[i]}deg);z-index:${i + 1}">`).join('');
  const L = four ? { h: 60, ht: 128, pt: 296, pill: 392 } : { h: 76, ht: 130, pt: 318, pill: 408 };
  return `<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${ROOT}/assets/fonts.css"><style>*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;font-family:Manrope,sans-serif;background:radial-gradient(120% 120% at 85% 40%,#EFE6D9 0%,#F4EDE3 55%);color:#2F2924}
.eb{position:absolute;left:64px;top:88px;font-size:21px;font-weight:700;letter-spacing:.02em;color:#B98324}
h1{position:absolute;left:62px;top:${L.ht}px;width:560px;font-family:Forum,Georgia,serif;font-weight:400;font-size:${L.h}px;line-height:1.1}
p{position:absolute;left:64px;top:${L.pt}px;width:470px;font-size:25px;line-height:1.45;color:#6E4F3C;font-weight:700}
.pill{position:absolute;left:64px;top:${L.pill}px;background:#FFFCF8;border:1.5px solid #E2D6C6;border-radius:999px;padding:11px 22px;font-size:21px;font-weight:600;color:#3A332D}
.u{position:absolute;left:64px;bottom:40px;font-size:21px;font-weight:600;color:#7A6E62}.u:before{content:"";display:block;width:64px;height:6px;border-radius:3px;background:#B98324;margin-bottom:20px}
img{position:absolute;object-fit:cover;object-position:top;border-radius:10px;border:5px solid #FFFCF8;box-shadow:0 22px 40px -18px rgba(70,45,25,.45),0 2px 6px rgba(70,45,25,.12)}</style></head>
<body><div class="eb">${c.eb}</div><h1>${c.h}</h1><p>${c.p}</p><div class="pill">${c.pill}</div><div class="u">voznesenskaya.ch</div>${fan}</body></html>`;
}
(async () => {
  const which = process.argv[2] ? [process.argv[2]] : Object.keys(CARDS);
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(f => fs.existsSync(f));
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage();
  const tmp = path.join(ROOT, '_i18n', '.og_tmp.html');
  for (const t of which) {
    fs.writeFileSync(tmp, html(CARDS[t])); await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
    await pg.screenshot({ path: path.join(ROOT, t, 'og-image.jpg'), type: 'jpeg', quality: 88 }); console.log('ok', t + '/og-image.jpg');
  }
  fs.rmSync(tmp, { force: true }); await b.close();
})();
