// Проверка зеркала: node _i18n/smoke.js [--full]
// Поднимает локальный сервер, открывает главную, «Твой путь», страницу тестов и все тесты на ru/uk/de/en (ширина телефона 390 px).
// Ошибка — если на странице JS-ошибка, битый ресурс или (для de/en) остался русский текст, кроме кодовых слов.
// --full: дополнительно проходит каждый тест до разбора на каждом языке.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..'); const PORT = 8899; const BASE = `http://localhost:${PORT}`;
const FULL = process.argv.includes('--full');
const LANGS = ['ru', 'uk', 'de', 'en'];
const TESTS = ['kompas', 'roza-lyubvi', 'stupeni', 'blizost'];
const CODE = /ВСТРЕЧА|ОТЗЫВ|ЗАЯВКА|РАССЫЛКА|ПОРЯДОК/g;
const ALLOWED = /Свої люди|Ирина Вознесенская|Русский|Русская|RU/; // подписи переключателя языков и т. п.
function cyr(txt) { return [...new Set((txt.replace(CODE, '').match(/[^\n]{0,30}[А-Яа-яЁё][^\n]{0,30}/g) || []).filter(x => !/^\s*(RU|Русский)\s*$/.test(x)))]; }
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const b = await chromium.launch(); const fails = [];
  const pages = [];
  for (const l of LANGS) {
    const pre = l === 'ru' ? '' : `/${l}`;
    pages.push([`${pre}/`, l], [`${pre}/put/`, l], [`/testy/#lang=${l}`, l], [`/privacy/#lang=${l}`, l], [`/impressum/#lang=${l}`, l]);
    for (const t of TESTS) pages.push([`/${t}/#lang=${l}`, l]);
  }
  for (const [u, l] of pages) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = [];
    await p.addInitScript(lang => { try { localStorage.setItem('irinaTestsLang', lang); } catch (e) {} }, l);
    p.on('pageerror', e => errs.push('js: ' + e.message)); p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(BASE)) errs.push('http ' + r.status() + ' ' + r.url()); });
    await p.goto(BASE + u); await p.waitForTimeout(1200);
    const txt = await p.evaluate(() => document.body.innerText);
    const c = (l === 'de' || l === 'en') ? cyr(txt) : [];
    const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (errs.length || c.length || wide) fails.push({ page: u, errs: errs.slice(0, 3), cyrillic: c.slice(0, 5), horizontalScroll: wide });
    console.log((errs.length || c.length || wide) ? 'FAIL' : 'ok  ', u);
    await ctx.close();
  }
  if (FULL) for (const t of TESTS) for (const l of LANGS) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(`${BASE}/${t}/#lang=${l}`); await p.waitForTimeout(900);
    await p.evaluate(() => { document.querySelectorAll('[data-greeting] fieldset').forEach(f => { const i = f.querySelector('input'); if (i && !i.checked) i.click(); }); document.querySelectorAll('[data-greeting] select').forEach(s => { s.selectedIndex = 1; s.dispatchEvent(new Event('change', { bubbles: true })); }); });
    await p.click('#svGo'); await p.waitForTimeout(400);
    if (await p.isVisible('#goTest').catch(() => false)) { await p.click('#goTest'); await p.waitForTimeout(500); }
    if (await p.isVisible('#nameMe').catch(() => false)) await p.fill('#nameMe', 'Anna');
    if (await p.isVisible('#nameP').catch(() => false)) await p.fill('#nameP', 'Oleg');
    if (await p.$('#pick-f')) { await p.click('#pick-f'); await p.waitForTimeout(300); }
    if (await p.isVisible('#startBtn').catch(() => false)) await p.click('#startBtn');
    await p.waitForTimeout(400);
    let rnd = 3; const R = () => { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; };
    for (let k = 0; k < 25; k++) {
      if (await p.isVisible('#result')) break;
      const picks = []; for (let z = 0; z < 60; z++) picks.push(R());
      await p.evaluate(picks => { let pi = 0; const q = document.getElementById('quiz'); const groups = new Map();
        q.querySelectorAll('#qlist button, #quiz .card button').forEach(bt => { if (bt.id === 'next' || bt.id === 'back') return; const g = bt.parentElement; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(bt); });
        groups.forEach(bs => { bs[Math.floor(picks[(pi++) % picks.length] * bs.length)].click(); });
        q.querySelectorAll('input[type=range]').forEach(r => { r.value = String(Math.floor(picks[(pi++) % picks.length] * 11)); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); });
        [...q.querySelectorAll('button')].filter(b => b.textContent.trim() === '+').forEach(b => { for (let z = 0; z < 10; z++) b.click(); });
        q.querySelectorAll('textarea').forEach((t, i) => { if (i === 0) { t.value = 'Test'; t.dispatchEvent(new Event('input', { bubbles: true })); } });
      }, picks);
      await p.waitForTimeout(150);
      if (!(await p.$eval('#next', b => !b.disabled).catch(() => false))) break;
      await p.click('#next'); await p.waitForTimeout(250);
    }
    await p.waitForTimeout(1200);
    const ok = await p.isVisible('#result'); const txt = await p.evaluate(() => document.body.innerText);
    const c = (l === 'de' || l === 'en') ? cyr(txt) : [];
    if (!ok || errs.length || c.length) fails.push({ test: t, lang: l, result: ok, errs: errs.slice(0, 3), cyrillic: c.slice(0, 8) });
    console.log((!ok || errs.length || c.length) ? 'FAIL' : 'ok  ', `${t} ${l} full run`);
    await ctx.close();
  }
  await b.close(); srv.kill();
  console.log(fails.length ? 'PROBLEMS:\n' + JSON.stringify(fails, null, 1) : 'ALL OK');
  process.exit(fails.length ? 1 : 0);
})();
