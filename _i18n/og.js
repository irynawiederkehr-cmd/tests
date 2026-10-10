// Картинки-превью ссылок (og:image) voznesenskaya.ch: NODE_PATH=$(npm root -g) node _i18n/og.js [check]
// Правило Ирины (07.10.2026): у КАЖДОЙ страницы своя картинка-превью 1200×630, на языке страницы.
//   Без фотографий (Ирина будет менять фото на сайте). Рисунок «Пустить корни» (выбран Ириной 07.10.2026):
//   эдельвейс из логотипа на стебле, под землёй расходятся корни. Слева текст страницы.
//   Главная с 10.10.2026 — акварель «Ступени» (восемь ступеней, внизу осколки, наверху чаша с золотыми швами); steps(). art() — прежний рисунок «Пустить корни», не используется.
//   «Путь» с 10.10.2026 — акварельная чаша с золотыми швами (метод «Ступени», история чаши); bowls(). trail() — запасной рисунок, не используется.
//   `node _i18n/og.js put` — пересобрать только картинки «Пути».
//   Пишет {папка}/og-image.jpg (русский) и og-image.{uk,de,en}.jpg; pages.py сам ставит их в языковые страницы.
//   Тесты (kompas, stupeni, …) открываются на всех языках по одному адресу — у них своя картинка с веером разбора.
//   `node _i18n/og.js check` — найдёт страницы без превью.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const EB = { ru: 'ИРИНА ВОЗНЕСЕНСКАЯ · МЕТОД «СТУПЕНИ»', uk: 'ІРИНА ВОЗНЕСЕНСЬКА · МЕТОД «СХОДИНКИ»', de: 'IRYNA VOZNESENSKAYA · METHODE «STUFEN»', en: 'IRYNA VOZNESENSKAYA · THE “STEPS” METHOD' };
const CARDS = [
  { out: 'og-image',
    art: () => steps(),
    ru: ['Жизнь после переезда <em>можно собрать заново</em>', 'Шаг за шагом, с того места, где ты сейчас. Коучинг по методу «Ступени».'],
    uk: ['Життя після переїзду <em>можна зібрати заново</em>', 'Крок за кроком, з того місця, де ти зараз. Коучинг за методом «Сходинки».'],
    de: ['Das Leben nach dem Umzug <em>lässt sich neu zusammensetzen</em>', 'Schritt für Schritt, von dort aus, wo du gerade stehst. Coaching nach der Methode «Stufen».'],
    en: ['Life after moving <em>can be put back together</em>', 'Step by step, from where you are now. Coaching with the “Steps” method.'] },
  { out: 'put/og-image',
    art: () => bowls(),
    ru: ['Ступени. <em>Твой путь</em> в новой стране', 'Восемь ступеней — история одной чаши, которая разбилась и собирается золотом. Посмотри, где ты сейчас.'],
    uk: ['Сходинки. <em>Твій шлях</em> у новій країні', 'Вісім сходинок — історія однієї чаші, яка розбилася і збирається золотом. Подивися, де ти зараз.'],
    de: ['Stufen. <em>Dein Weg</em> im neuen Land', 'Acht Stufen — eine Schale, die zerbrochen ist und sich mit Gold neu zusammensetzt. Schau, wo du stehst.'],
    en: ['Steps. <em>Your path</em> in a new country', 'Eight steps — the story of one bowl that broke and is coming together again with gold. See where you are now.'] },
];
// эдельвейс из логотипа (favicon.svg)
const OUT = 'M50 50 C42 40 43 24 50 15 C57 24 58 40 50 50Z', INN = 'M50 50 C45 43 45 32 50 26 C55 32 55 43 50 50Z';
function logo(cx, cy, size) {
  let g = `<g transform="translate(${cx - size / 2},${cy - size / 2}) scale(${size / 100})"><circle cx="50" cy="50" r="46" fill="#FFFCF8" stroke="#6E4F3C" stroke-width="3"/>`;
  for (let i = 0; i < 8; i++) g += `<g transform="rotate(${22.5 + i * 45} 50 50)"><path d="${OUT}" fill="#E3E6D6" stroke="#66704F" stroke-width="2"/></g>`;
  for (let i = 0; i < 8; i++) g += `<g transform="rotate(${i * 45} 50 50)"><path d="${INN}" fill="#EADFCF" stroke="#6E4F3C" stroke-width="2"/></g>`;
  return g + '<circle cx="50" cy="50" r="7" fill="#B98324"/></g>';
}
function art() {
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, U = (a, b) => a + (b - a) * rnd();
  const gx = 930, ground = 420; let roots = '';
  const root = (x, y, ang, len, w, d) => {
    if (!d || len < 12) return;
    const x2 = x + len * Math.cos(ang * Math.PI / 180), y2 = y + len * Math.sin(ang * Math.PI / 180);
    roots += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} Q${((x + x2) / 2 + U(-10, 10)).toFixed(0)} ${((y + y2) / 2 + U(-6, 6)).toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}" stroke="#8B6A52" stroke-width="${w.toFixed(1)}" fill="none" stroke-linecap="round"/>`;
    for (const da of [-28, 25]) root(x2, y2, ang + da + U(-10, 10), len * U(.62, .75), w * .7, d - 1);
  };
  for (const a of [55, 80, 105, 130]) root(gx, ground + 4, a, 70, 5, 5);
  const leaves = [[380, 1], [340, -1], [305, 1]].map(([y, s]) => `<g transform="translate(${gx + (s > 0 ? 2 : -2)},${y}) rotate(${s > 0 ? -35 : 215})"><path d="M0 0 C16 -11 48 -12 72 -2 C48 7 16 7 0 0Z" fill="#E3E6D6" stroke="#66704F" stroke-width="2.4"/></g>`).join('');
  return `<circle cx="${gx}" cy="190" r="150" fill="#EFE5D6"/><ellipse cx="${gx}" cy="${ground + 170}" rx="300" ry="175" fill="#EADFCF"/>
<path d="M640 ${ground} C740 ${ground - 10} 840 ${ground + 6} 930 ${ground - 2} S1120 ${ground + 8} 1200 ${ground - 4}" fill="none" stroke="#6E4F3C" stroke-width="3" stroke-linecap="round"/>${roots}
<path d="M${gx} ${ground + 4} C${gx - 8} 360 ${gx + 10} 300 ${gx} 250" stroke="#66704F" stroke-width="6" fill="none" stroke-linecap="round"/>${leaves}${logo(gx, 180, 190)}`;
}
function steps() {   // главная: акварель «Ступени», белая бумага сливается с фоном (multiply)
  return `<image href="file://${ROOT}/home/img/stupeni-hero.jpg" x="690" y="12" width="490" height="608" preserveAspectRatio="xMidYMid meet" style="mix-blend-mode:multiply"/>`;
}
function bowls() {   // «Путь»: акварель «Золотые швы», белая бумага сливается с фоном (multiply)
  return `<image href="file://${ROOT}/put/img/07-zolotye-shvy.jpg" x="650" y="-150" width="560" height="750" preserveAspectRatio="xMidYMid slice" style="mix-blend-mode:multiply"/>`;
}
function trail() {   // «Путь»: тропа из восьми стоянок, восьмая — эдельвейс
  const pts = [[650, 600], [745, 560], [870, 575], [985, 520], [930, 450], [800, 430], [840, 360], [960, 330], [1040, 250]];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(0)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(0)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(0)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(0)} ${p2[0]} ${p2[1]}`; }
  const hills = `<path d="M560 630 C620 520 720 450 820 450 S1050 390 1200 400 L1200 630Z" fill="#EADFCF"/><path d="M620 630 C680 580 780 560 900 555 S1120 520 1200 530 L1200 630Z" fill="#E3E6D6"/>`;
  const stops = pts.slice(1, 8).map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="15" fill="#FFFCF8" stroke="#6E4F3C" stroke-width="2.5"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="15" fill="#6E4F3C">${i + 1}</text>`).join('');
  const [lx, ly] = pts[8];
  return `<circle cx="${lx}" cy="${ly - 40}" r="150" fill="#EFE5D6"/>${hills}<path d="${d}" fill="none" stroke="#B98324" stroke-width="4" stroke-dasharray="2 11" stroke-linecap="round"/>${stops}
<circle cx="${lx}" cy="${ly - 40}" r="104" fill="none" stroke="#B98324" stroke-width="2" stroke-dasharray="4 6"/>${logo(lx, ly - 40, 170)}<circle cx="${lx + 62}" cy="${ly + 18}" r="19" fill="#B98324"/><text x="${lx + 62}" y="${ly + 25}" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="18" fill="#fff">8</text>`;
}
function html(eb, h, p, drawing = art) {
  const plain = h.replace(/<[^>]+>/g, ''); const fs_ = plain.length > 48 ? 54 : plain.length > 30 ? 62 : 68;
  return `<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${ROOT}/assets/fonts.css"><style>*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;font-family:Manrope,sans-serif;background:#F4EDE3;color:#2F2924}em{font-style:normal;color:#6E4F3C}
.eb{position:absolute;left:64px;top:62px;font-size:18px;font-weight:700;letter-spacing:.14em;color:#7A6E62}
.tx{position:absolute;left:62px;top:128px;width:600px}h1{width:600px;font-family:Forum,Georgia,serif;font-weight:400;font-size:${fs_}px;line-height:1.08}
p{margin:26px 0 0 2px;width:540px;font-size:23px;line-height:1.45;color:#5D554D;font-weight:500}
.u{position:absolute;left:64px;bottom:44px;display:flex;align-items:center;gap:14px;font-size:19px;font-weight:700;color:#4F5E3E}.u:before{content:"";width:46px;height:4px;border-radius:2px;background:#B98324}</style></head>
<body><svg style="position:absolute;left:0;top:0" width="1200" height="630">${drawing()}</svg><div class="eb">${eb}</div><div class="tx"><h1>${h}</h1><p>${p}</p></div><div class="u">voznesenskaya.ch</div></body></html>`;
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
  const tmp = path.join(ROOT, '_i18n', '.og_tmp.html');
  for (const c of CARDS.filter(c => !process.argv[2] || c.out === (process.argv[2] === 'put' ? 'put/og-image' : process.argv[2]))) for (const l of ['ru', 'uk', 'de', 'en']) {
    const out = c.out + (l === 'ru' ? '.jpg' : `.${l}.jpg`);
    fs.writeFileSync(tmp, html(EB[l], c[l][0], c[l][1], c.art || art)); await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
    await pg.screenshot({ path: path.join(ROOT, out), type: 'jpeg', quality: 88 }); console.log('ok', out);
  }
  fs.rmSync(tmp, { force: true }); await b.close();
})();
