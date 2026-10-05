/* =====================================================================
   Данные и конфиденциальность — общее для всех тестов (с 02.10.2026).
   - Ответы тестов хранятся только в браузере человека и через 90 дней удаляются сами.
   - Кнопка «Удалить мои ответы».
   - Страна спрашивается в мини-опросе (раньше — в анкете перед PDF).
   - Ссылки на Политику конфиденциальности и Выходные данные в подвале.
   Тексты на четырёх языках — здесь же (PRIV). Подключается после brand.js, до теста.
   ===================================================================== */
const PAGE_LANG = (typeof LANG !== 'undefined') ? LANG : 'ru';
const DATA_DAYS = 90;

/* Страны — коды ISO; названия показываются на языке страницы, в таблицу уходит русское название. */
const COUNTRY_TOP = ['CH','DE','AT','FR','IT','ES','NL','BE','GB','PL','CZ','IL','US','CA','UA','RU','BY','KZ'];
const COUNTRY_ALL = ['AU','AT','AZ','AL','DZ','AD','AR','AM','AF','BD','BH','BY','BE','BG','BO','BA','BR','GB','HU','VE','VN','GH','DE','HK','GR','GE','DK','DO','EG','IL','IN','ID','JO','IQ','IR','IE','IS','ES','IT','KZ','KH','CA','QA','KE','CY','KG','CN','CO','CR','CU','KW','LV','LB','LT','LI','LU','MU','MY','MV','MT','MA','MX','MD','MC','MN','ME','NP','NG','NL','NZ','NO','AE','OM','PK','PA','PY','PE','PL','PT','RU','RO','SA','MK','RS','SG','SK','SI','US','TJ','TH','TW','TN','TM','TR','UG','UZ','UA','UY','PH','FI','FR','HR','CZ','CL','CH','SE','LK','EC','EE','ZA','KR','JM','JP'];
const countryName = (() => { try { const d = new Intl.DisplayNames([PAGE_LANG], { type:'region' }); return c => d.of(c); } catch(e){ return c => c; } })();
const countryRu = (() => { try { const d = new Intl.DisplayNames(['ru'], { type:'region' }); return c => d.of(c); } catch(e){ return c => c; } })();
const COUNTRIES = COUNTRY_ALL.map(countryRu);
const OTHER_COUNTRY = 'Другая страна';

const PRIV_ALL = {
  ru: {
    countryQ: 'Где ты сейчас живёшь?', countryPick: 'Выбери страну', countryTop: 'Часто выбирают', countryAll: 'Все страны', countryOther: 'Другая страна',
    countryErr: 'Выбери, пожалуйста, страну, в которой ты сейчас живёшь.',
    countryNote: 'Страна нужна, чтобы показать в разборе подходящее приглашение и полезные ссылки.',
    privacy: 'Политика конфиденциальности', impressum: 'Выходные данные', home: 'Главная', allTests: 'Все тесты',
    onlyYou: 'Твои ответы остаются только у тебя. Я их не вижу.',
    keepUntil: d => `Твои ответы и разбор хранятся только на этом устройстве, до ${d}. Потом они удалятся сами. Скачай PDF, если хочешь сохранить разбор.`,
    del: 'Удалить мои ответы', delAsk: 'Удалить все ответы этого теста с этого устройства? Разбор тоже исчезнет. Если хочешь его сохранить, сначала скачай PDF.',
    delYes: 'Да, удалить', delNo: 'Отмена', delDone: 'Ответы удалены с этого устройства.'
  },
  uk: {
    countryQ: 'Де ти зараз живеш?', countryPick: 'Обери країну', countryTop: 'Часто обирають', countryAll: 'Усі країни', countryOther: 'Інша країна',
    countryErr: 'Обери, будь ласка, країну, у якій ти зараз живеш.',
    countryNote: 'Країна потрібна, щоб показати в розборі відповідне запрошення та корисні посилання.',
    privacy: 'Політика конфіденційності', impressum: 'Вихідні дані', home: 'Головна', allTests: 'Усі тести',
    onlyYou: 'Твої відповіді залишаються тільки в тебе. Я їх не бачу.',
    keepUntil: d => `Твої відповіді та розбір зберігаються тільки на цьому пристрої, до ${d}. Потім вони видаляться самі. Завантаж PDF, якщо хочеш зберегти розбір.`,
    del: 'Видалити мої відповіді', delAsk: 'Видалити всі відповіді цього тесту з цього пристрою? Розбір теж зникне. Якщо хочеш його зберегти, спочатку завантаж PDF.',
    delYes: 'Так, видалити', delNo: 'Скасувати', delDone: 'Відповіді видалено з цього пристрою.'
  },
  de: {
    countryQ: 'Wo lebst du zurzeit?', countryPick: 'Wähle ein Land', countryTop: 'Häufig gewählt', countryAll: 'Alle Länder', countryOther: 'Anderes Land',
    countryErr: 'Wähle bitte das Land, in dem du zurzeit lebst.',
    countryNote: 'Das Land brauche ich, um dir in der Auswertung die passende Einladung und hilfreiche Links zu zeigen.',
    privacy: 'Datenschutzerklärung', impressum: 'Impressum', home: 'Startseite', allTests: 'Alle Tests',
    onlyYou: 'Deine Antworten bleiben nur bei dir. Ich sehe sie nicht.',
    keepUntil: d => `Deine Antworten und die Auswertung sind nur auf diesem Gerät gespeichert, bis ${d}. Danach werden sie automatisch gelöscht. Lade das PDF herunter, wenn du die Auswertung behalten möchtest.`,
    del: 'Meine Antworten löschen', delAsk: 'Alle Antworten dieses Tests von diesem Gerät löschen? Auch die Auswertung verschwindet. Wenn du sie behalten möchtest, lade zuerst das PDF herunter.',
    delYes: 'Ja, löschen', delNo: 'Abbrechen', delDone: 'Die Antworten wurden von diesem Gerät gelöscht.'
  },
  en: {
    countryQ: 'Where do you live now?', countryPick: 'Choose a country', countryTop: 'Frequently chosen', countryAll: 'All countries', countryOther: 'Other country',
    countryErr: 'Please choose the country where you live now.',
    countryNote: 'I need the country to show you the right invitation and useful links in your results.',
    privacy: 'Privacy policy', impressum: 'Legal notice', home: 'Home', allTests: 'All tests',
    onlyYou: 'Your answers stay with you only. I cannot see them.',
    keepUntil: d => `Your answers and results are stored only on this device, until ${d}. After that they are deleted automatically. Download the PDF if you want to keep your results.`,
    del: 'Delete my answers', delAsk: 'Delete all answers to this test from this device? Your results will disappear too. If you want to keep them, download the PDF first.',
    delYes: 'Yes, delete', delNo: 'Cancel', delDone: 'Your answers have been deleted from this device.'
  }
};
const PRIV = PRIV_ALL[PAGE_LANG] || PRIV_ALL.ru;

/* ---------- 1. Автоудаление ответов через 90 дней ---------- */
(function purge(){
  try {
    const limit = Date.now() - DATA_DAYS * 864e5;
    for (let i = localStorage.length - 1; i >= 0; i--){
      const k = localStorage.key(i);
      if (!k || !/^irinaTests\./.test(k)) continue;
      let v = null; try { v = JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){}
      const t = v && (v.t || v.startedAt);
      if (!t || t < limit) localStorage.removeItem(k);
    }
    localStorage.removeItem('irinaTestsLead');   // прежняя анкета (с e-mail) больше не хранится
  } catch(e){}
})();

/* ключ сохранённых ответов текущего теста */
function answersKey(){ return (typeof TEST_META !== 'undefined') ? 'irinaTests.' + TEST_META.id + '.v1' : ''; }
function answersSavedAt(){ try { const v = JSON.parse(localStorage.getItem(answersKey()) || 'null'); return v ? (v.t || v.startedAt || 0) : 0; } catch(e){ return 0; } }
function retentionLine(){
  const t = answersSavedAt() || Date.now();
  const d = new Date(t + DATA_DAYS * 864e5).toLocaleDateString(typeof DATE_LOCALE !== 'undefined' ? DATE_LOCALE : 'ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' });
  return PRIV.keepUntil(d);
}

/* ---------- 2. Страна в мини-опросе ---------- */
const COUNTRY_KEY = 'irinaTestsCountry';
function surveyCountry(){
  const s = document.getElementById('svCountry');
  if (s && s.value) return s.value;
  try { return localStorage.getItem(COUNTRY_KEY) || ''; } catch(e){ return ''; }
}
// Тесты раньше брали страну из анкеты (window.__leadCountry). Теперь она всегда берётся из мини-опроса.
try { Object.defineProperty(window, '__leadCountry', { configurable: true, get: surveyCountry, set: () => {} }); } catch(e){}

function countrySelectHtml(id){
  return `<select id="${id}"><option value="">${PRIV.countryPick}</option></select>`;
}
function fillCountrySelect(sel, value){
  if (!sel || sel.options.length > 1) return;
  const g1 = document.createElement('optgroup'); g1.label = PRIV.countryTop;
  COUNTRY_TOP.forEach(c => g1.appendChild(new Option(countryName(c), countryRu(c))));
  const g2 = document.createElement('optgroup'); g2.label = PRIV.countryAll;
  COUNTRY_ALL.map(c => [countryName(c), countryRu(c)]).sort((x, y) => x[0].localeCompare(y[0], PAGE_LANG)).forEach(([n, v]) => g2.appendChild(new Option(n, v)));
  g2.appendChild(new Option(PRIV.countryOther, OTHER_COUNTRY));
  sel.appendChild(g1); sel.appendChild(g2);
  if (value && (COUNTRIES.includes(value) || value === OTHER_COUNTRY)) sel.value = value;
}
(function surveyCountryField(){
  const box = document.querySelector('[data-greeting] .surveys'); if (!box || document.getElementById('svCountry')) return;
  const fs = document.createElement('fieldset'); fs.className = 'survey sv-country';
  fs.innerHTML = `<legend>${PRIV.countryQ} *</legend>${countrySelectHtml('svCountry')}<p class="note">${PRIV.countryNote}</p>`;
  box.appendChild(fs);
  let saved = ''; try { saved = localStorage.getItem(COUNTRY_KEY) || ''; } catch(e){}
  const sel = fs.querySelector('select'); fillCountrySelect(sel, saved);
  sel.addEventListener('change', () => { try { localStorage.setItem(COUNTRY_KEY, sel.value); } catch(e){} });
  // без страны тест не открывается (проверка срабатывает раньше общей кнопки «Перейти к тестированию»)
  document.addEventListener('click', ev => {
    const go = ev.target.closest && ev.target.closest('#svGo'); if (!go) return;
    const a = (typeof surveyAnswers === 'function') ? surveyAnswers() : { heard: [1], interest: [1] };
    if (!a.heard.length || !a.interest.length) return;          // об этих вопросах скажет общая проверка
    if (!sel.value){
      ev.stopPropagation(); ev.preventDefault();
      const err = document.getElementById('svErr'); if (err){ err.textContent = PRIV.countryErr; err.hidden = false; }
      sel.focus();
    } else { try { localStorage.setItem(COUNTRY_KEY, sel.value); } catch(e){} }
  }, true);
})();

/* ---------- 3. Удалить мои ответы ---------- */
function deleteAnswersHtml(){
  if (!answersKey()) return '';
  return `<div class="del-answers"><button type="button" class="linkbtn" data-del-answers>${PRIV.del}</button>
    <div class="del-ask" hidden><p>${PRIV.delAsk}</p><div class="row"><button type="button" class="btn small" data-del-yes>${PRIV.delYes}</button><button type="button" class="btn ghost small" data-del-no>${PRIV.delNo}</button></div></div>
    <p class="note del-done" hidden>${PRIV.delDone}</p></div>`;
}
document.addEventListener('click', ev => {
  const b = ev.target.closest && ev.target.closest('[data-del-answers],[data-del-yes],[data-del-no]'); if (!b) return;
  const box = b.closest('.del-answers'), ask = box.querySelector('.del-ask');
  if (b.hasAttribute('data-del-answers')){ ask.hidden = !ask.hidden; return; }
  if (b.hasAttribute('data-del-no')){ ask.hidden = true; return; }
  try {
    const pre = 'irinaTests.' + TEST_META.id + '.';
    for (let i = localStorage.length - 1; i >= 0; i--){ const k = localStorage.key(i); if (k && k.indexOf(pre) === 0) localStorage.removeItem(k); }
  } catch(e){}
  ask.hidden = true; box.querySelector('.del-done').hidden = false;
  setTimeout(() => { location.hash = ''; location.reload(); }, 900);
});

/* ---------- 4. Подвал: правовые ссылки и удаление ответов ---------- */
function legalUrl(page){
  const root = (typeof SITE_BASE !== 'undefined') ? SITE_BASE : '../';
  return root + page + '/';
}
function privacyLinksHtml(){
  const root = (typeof SITE_BASE !== 'undefined') ? SITE_BASE : '../';
  return `<a href="${root}">${PRIV.home}</a> · <a href="${root}testy/">${PRIV.allTests}</a> · <a href="${legalUrl('privacy')}">${PRIV.privacy}</a> · <a href="${legalUrl('impressum')}">${PRIV.impressum}</a>`;
}
(function footer(){
  const f = document.querySelector('.wrap .copy'); if (!f || f.querySelector('.legal-links')) return;
  const p = document.createElement('span'); p.className = 'legal-links'; p.innerHTML = privacyLinksHtml();
  f.appendChild(document.createElement('br')); f.appendChild(p);
  if (answersKey() && document.getElementById('intro')){
    const d = document.createElement('div'); d.innerHTML = deleteAnswersHtml(); f.appendChild(d.firstElementChild);
  }
})();
/* строка «Твои ответы остаются только у тебя» на стартовой странице, рядом с кнопкой начала */
(function startNote(){
  const host = document.querySelector('#testStart [data-share="compact"]'); if (!host || document.querySelector('.only-you')) return;
  const p = document.createElement('p'); p.className = 'note only-you';
  p.innerHTML = `${PRIV.onlyYou} <a href="${legalUrl('privacy')}">${PRIV.privacy}</a>`;
  host.parentNode.insertBefore(p, host);
})();

/* ---------- 6. Общая шапка сайта на каждой странице (тесты, «Тесты», правовые) — вернуться можно откуда угодно ---------- */
(function siteHeader(){
  if (document.querySelector('.sitebar')) return;
  const root = (typeof SITE_BASE !== 'undefined') ? SITE_BASE : '../';
  const T = {
    ru: { sub: 'специалист по адаптации · коуч', name: 'Ирина Вознесенская', nav: ['Обо мне', 'Работа со мной', 'Продукты', 'Твой путь', 'Тесты', 'Свои люди'], cta: 'Знакомство' },
    uk: { sub: 'фахівчиня з адаптації · коуч', name: 'Ірина Вознесенська', nav: ['Про мене', 'Робота зі мною', 'Продукти', 'Твій шлях', 'Тести', 'Свої люди'], cta: 'Знайомство' },
    de: { sub: 'Coach fürs Ankommen', name: 'Iryna Voznesenskaya', nav: ['Über mich', 'Arbeit mit mir', 'Angebote', 'Dein Weg', 'Tests', 'Svoi ludi'], cta: 'Kennenlernen' },
    en: { sub: 'relocation coach', name: 'Iryna Voznesenskaya', nav: ['About me', 'Work with me', 'Services', 'Your path', 'Tests', 'Svoi ludi'], cta: 'Intro call' }
  }[PAGE_LANG] || {};
  const L = T.nav ? T : { sub: 'специалист по адаптации · коуч', name: 'Ирина Вознесенская', nav: ['Обо мне', 'Работа со мной', 'Продукты', 'Твой путь', 'Тесты', 'Свои люди'], cta: 'Знакомство' };
  const hrefs = [root + '#who', root + '#requests', root + '#path', root + 'put/', root + 'testy/', 'https://svoiludi.ch/'];
  const here = location.pathname.replace(/\/+$/, '').split('/').pop();
  const h = document.createElement('header'); h.className = 'sitebar';
  h.innerHTML = `<div class="sitebar-in">
    <a class="sb-mark" href="${root}"><span class="sb-mono av">${typeof AVATAR_SVG !== "undefined" ? AVATAR_SVG : "ИВ"}</span><span><b>${L.name}</b><small>${L.sub}</small></span></a>
    <nav class="sb-nav" aria-label="Menu">${L.nav.map((t, i) => `<a href="${hrefs[i]}"${i === 4 && here === 'testy' ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
    <a class="sb-cta" href="https://t.me/IrynaNeuroCoach" target="_blank" rel="noopener">${L.cta}</a></div>`;
  document.body.insertBefore(h, document.body.firstChild);
})();
