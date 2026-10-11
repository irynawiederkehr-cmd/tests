// Значок «Мой проект «Свои люди»» для подвала voznesenskaya.ch (11.10.2026, просьба Ирины «на сайте Ирины сделай такую кнопку»).
// Тот же вид, что значки svoiludi.ch/badge/ («Я в справочнике», «Мы в «Своих людях»»): плашка 280 × 80, логотип «круг своих»,
// мелкая строка, главная надпись Forum, «svoiludi.ch». Рисуется вдвое крупнее (560 × 160) для чётких экранов.
// Картинки: assets/svoi/avtor-{ru|uk|de|en}-{light|dark}.png. Ставит их в подвал каждой страницы assets/vz-app.js (svoiBadge).
// Запуск из корня репозитория после правки текста или вида:  NODE_PATH=$(npm root -g) node _i18n/svoi_badge.js
// Рисунок значка повторяет drawMini() из svoiludi/badge/index.html — меняется там, меняем и здесь. Логотип — _i18n/svoi_logo.svg.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'); const PORT = 8897;
const TX = {
  ru: { eb: 'ДЛЯ СВОИХ В ШВЕЙЦАРИИ', big: 'Мой проект «Свои люди»' },
  uk: { eb: 'ДЛЯ СВОЇХ У ШВЕЙЦАРІЇ', big: 'Мій проєкт «Свої люди»' },
  de: { eb: 'VERZEICHNIS IN DER SCHWEIZ', big: 'Mein Projekt «Svoi ludi»' },
  en: { eb: 'A DIRECTORY IN SWITZERLAND', big: 'My project “Svoi ludi”' }
};
const LOGO = fs.readFileSync(path.join(__dirname, 'svoi_logo.svg'), 'utf8');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(f => fs.existsSync(f));
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const out = path.join(ROOT, 'assets/svoi'); fs.mkdirSync(out, { recursive: true });
  try {
    const pg = await (await b.newContext({ viewport: { width: 800, height: 400 } })).newPage();
    await pg.goto(`http://localhost:${PORT}/offline.html`);
    await pg.setContent('<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/fonts.css"></head><body><span style="font:400 20px Forum">Аа Aa</span><span style="font:700 20px Manrope">Аа Aa</span><span style="font:600 20px Manrope">Аа Aa</span></body></html>');
    for (const lang of Object.keys(TX)) for (const theme of ['light', 'dark']) {
      const url = await pg.evaluate(async ([t, theme, logo]) => {
        await document.fonts.ready;
        await Promise.all(['400 23px Forum', '700 9px Manrope', '600 11px Manrope'].map(f => document.fonts.load(f, t.big + t.eb)));
        const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logo); await img.decode();
        const cv = document.createElement('canvas'); cv.width = 560; cv.height = 160;
        const s = cv.width / 280, W = 280, H = 80, ctx = cv.getContext('2d'), dark = theme === 'dark';
        const fit = (text, font, size, max) => { let z = size; ctx.font = font(z); while (ctx.measureText(text).width > max && z > 10) { z -= 0.5; ctx.font = font(z); } };
        const spaced = px => { try { ctx.letterSpacing = px + 'px'; } catch (_) {} };
        ctx.scale(s, s);
        ctx.beginPath(); ctx.roundRect(1, 1, W - 2, H - 2, 14);
        ctx.fillStyle = dark ? '#4F5E3E' : '#FFFCF8'; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = dark ? '#66704F' : '#C9D2B6'; ctx.stroke();
        ctx.drawImage(img, 13, 13, 54, 54);
        const x = 78, max = W - x - 12;
        spaced(1.1); fit(t.eb, z => `700 ${z}px Manrope, Arial, sans-serif`, 9, max);
        ctx.fillStyle = dark ? '#F3E3C2' : '#B98324'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t.eb, x, 27);
        spaced(0); fit(t.big, z => `400 ${z}px Forum, Georgia, serif`, 23, max);
        ctx.fillStyle = dark ? '#FFFCF8' : '#4F5E3E'; ctx.fillText(t.big, x, 51);
        ctx.font = '600 11px Manrope, Arial, sans-serif'; ctx.fillStyle = dark ? '#E3E8D6' : '#7A6E62'; ctx.fillText('svoiludi.ch', x, 67);
        return cv.toDataURL('image/png');
      }, [TX[lang], theme, LOGO]);
      const f = path.join(out, `avtor-${lang}-${theme}.png`);
      fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); console.log('ok', path.relative(ROOT, f));
    }
  } finally { await b.close(); srv.kill(); }
})();
