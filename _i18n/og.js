// Картинки-превью ссылок (og:image) voznesenskaya.ch на UK, DE, EN: NODE_PATH=$(npm root -g) node _i18n/og.js [check]
// Правило Ирины (07.10.2026): у КАЖДОЙ страницы своя картинка-превью 1200×630, на языке страницы.
//   Русские картинки — оригиналы ({папка}/og-image.jpg). Отсюда собираются {папка}/og-image.{uk,de,en}.jpg:
//   справа та же фотография из русской картинки, слева текст на языке. pages.py сам ставит их в языковые страницы.
//   Тесты (kompas, stupeni, …) открываются на всех языках по одному адресу — у них одна русская картинка.
//   `node _i18n/og.js check` — найдёт страницы без превью.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const EB = { uk: 'ІРИНА ВОЗНЕСЕНСЬКА · КОУЧИНГ', de: 'IRYNA VOZNESENSKAYA · COACHING', en: 'IRYNA VOZNESENSKAYA · COACHING' };
const CARDS = [
  { src: 'og-image.jpg',
    uk: ['Не готові поради, а твій власний шлях', 'Ти переїхала, і життя ніби стало на паузу. Його можна знову запустити.'],
    de: ['Keine fertigen Ratschläge, sondern dein eigener Weg', 'Du bist umgezogen, und das Leben scheint auf Pause zu stehen. Du kannst es wieder in Gang bringen.'],
    en: ['Not ready-made advice, but your own path', 'You moved, and life seems to have been put on pause. You can start it again.'] },
  { src: 'put/og-image.jpg',
    uk: ['Твій шлях у новій країні', 'Вісім зупинок від перших днів до відчуття дому. Подивися, де ти зараз.'],
    de: ['Dein Weg im neuen Land', 'Acht Stationen von den ersten Tagen bis zum Gefühl, zu Hause zu sein. Schau, wo du gerade stehst.'],
    en: ['Your path in a new country', 'Eight stops from the first days to the feeling of being home. See where you are now.'] },
];
function html(photo, eb, h, p) {
  return `<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${ROOT}/assets/fonts.css"><style>*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#F4EDE3;position:relative;font-family:Manrope,sans-serif}
.eb{position:absolute;left:64px;top:96px;font-size:19px;font-weight:600;color:#7A6E62}
.tx{position:absolute;left:64px;top:150px;width:590px}
h1{font-family:Forum,Georgia,serif;font-weight:400;font-size:${h.length < 44 ? 58 : 52}px;line-height:1.2;color:#2F2924;width:580px}
p{font-size:23px;line-height:1.5;color:#6E4F3C;font-weight:600;margin-top:22px}
.bar{position:absolute;left:64px;top:538px;width:64px;height:6px;border-radius:3px;background:#B98324}.u{position:absolute;left:64px;top:563px;font-size:19px;color:#7A6E62;font-weight:500}
.ph{position:absolute;left:728px;top:0;width:472px;height:630px;background:url("data:image/jpeg;base64,${photo}") right top/auto 630px no-repeat}</style></head>
<body><div class="eb">${eb}</div><div class="tx"><h1>${h}</h1><p>${p}</p></div><div class="bar"></div><div class="u">voznesenskaya.ch</div><div class="ph"></div></body></html>`;
}
function check() {
  const miss = []; const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name);
    if (f.isDirectory()) { if (!/^(\.git|_i18n|node_modules|assets|preview)$/.test(f.name)) walk(p); }
    else if (f.name === 'index.html') { const h = fs.readFileSync(p, 'utf8'); const m = h.match(/og:image" content="https:\/\/voznesenskaya\.ch\/([^"]+)"/);
      if (!m) miss.push(path.relative(ROOT, p) + ' — нет og:image'); else if (!fs.existsSync(path.join(ROOT, m[1]))) miss.push(path.relative(ROOT, p) + ' — нет файла ' + m[1]); } } };
  walk(ROOT); console.log(miss.length ? 'Без превью:\n' + miss.join('\n') : 'Превью есть у всех страниц'); process.exitCode = miss.length ? 1 : 0;
}
(async () => {
  if (process.argv[2] === 'check') return check();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(f => fs.existsSync(f));
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage();
  for (const c of CARDS) { const photo = fs.readFileSync(path.join(ROOT, c.src)).toString('base64');
    for (const l of ['uk', 'de', 'en']) { const out = c.src.replace(/\.jpg$/, `.${l}.jpg`);
      const tmp = path.join(ROOT, '_i18n', '.og_tmp.html'); fs.writeFileSync(tmp, html(photo, EB[l], ...c[l])); await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
      await pg.screenshot({ path: path.join(ROOT, out), type: 'jpeg', quality: 88 }); console.log('ok', out); } }
  fs.rmSync(path.join(ROOT, '_i18n', '.og_tmp.html'), { force: true }); await b.close();
})();
