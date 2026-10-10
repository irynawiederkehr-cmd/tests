/* =====================================================================
   PDF разбора и бланка, форма «Хочешь получать мои материалы?», отправка в Google Таблицу.
   С 02.10.2026: PDF скачивается сразу, без анкеты. Результаты теста в таблицу НЕ уходят.
   В таблицу уходят: анонимная запись при скачивании PDF (тест, дата, язык, страна, источник, мини-опрос)
   и — только если человек сам заполнил форму — его контакты (без результатов).
   Тест задаёт: TEST_META {id, name}, buildBlocks(), showResult(), LEAD_HOOKS.
   Страны и PAGE_LANG — в privacy.js. Тексты на четырёх языках — здесь же (LT).
   ===================================================================== */
const LT_ALL = {
  ru: {
    dlTitle1: 'Скачать разбор', dlText1: 'Красивый PDF с разбором без вопросов теста: картинки, описания, рекомендации, план на 4 недели и вопросы для размышления.', dlBtn1: 'Скачать разбор',
    dlTitle: 'Скачать разбор и бланк для записей',
    dlText: 'Красивый PDF с разбором без вопросов теста: картинки, описания, рекомендации, план на 4 недели и вопросы для размышления. Вместе с ним скачается бланк для записей со всеми вопросами из разбора, чтобы распечатать его и ответить своей рукой.',
    dlBtn: 'Скачать разбор и бланк', again: 'Пройти заново',
    wsTitle: 'Бланк для записей', wsText: 'Все вопросы и шаги из твоего разбора с местом для ответов. Его можно распечатать и заполнить от руки.', wsBtn: 'Скачать бланк',
    matEyebrow: 'По желанию', matTitle: 'Хочешь получать мои материалы?',
    matText: 'Оставь имя и e-mail, и я буду присылать полезные материалы и рассказывать о новых тестах. Твои ответы на тест остаются только у тебя: мне придут лишь данные из этой формы.',
    name: 'Имя *', email: 'E-mail *', tg: 'Telegram', tgPh: '@username', wa: 'WhatsApp', waPh: '+41 79 …',
    consent: link => `Я соглашаюсь, что Ирина Вознесенская получит данные из этой формы, как описано в ${link} *`, consentLink: 'Политике конфиденциальности',
    news: 'Хочу получать письма с полезными материалами. Отписаться можно в любой момент.',
    adult: 'Мне есть 18 лет *', send: 'Отправить',
    errName: 'Напиши, пожалуйста, своё имя.', errEmail: 'Проверь e-mail: похоже, в нём ошибка.', errConsent: 'Чтобы отправить форму, нужно согласие.', errAdult: 'Этот тест предназначен для людей от 18 лет.',
    sent: 'Спасибо! Данные отправлены.', sendFail: 'Не получилось отправить. Проверь интернет и попробуй ещё раз.',
    noLib: 'Не получилось загрузить модуль PDF. Проверь интернет и обнови страницу.',
    making: 'Готовлю PDF…', madeMain: 'Разбор сохранён. Готовлю бланк для записей…',
    madeBoth: 'Готово! Сохранены два файла: разбор и бланк для записей. Если они не открылись, загляни в папку «Загрузки».',
    madeOne: 'Разбор сохранён. Если он не открылся, загляни в папку «Загрузки».',
    madeWsLater: 'Разбор сохранён. Бланк для записей можно скачать кнопкой ниже.',
    wsMaking: 'Готовлю бланк…', wsDone: 'Бланк сохранён. Распечатай его и пиши от руки.', wsFail: 'Не получилось подготовить бланк. Попробуй ещё раз.',
    cancel: 'Сохранение отменено.', fail: 'Не получилось подготовить PDF. Попробуй ещё раз.',
    wsFile: 'Бланк для записей', wsFoot: ' · бланк для записей'
  },
  uk: {
    dlTitle1: 'Завантажити розбір', dlText1: 'Гарний PDF із розбором без питань тесту: малюнки, описи, рекомендації, план на 4 тижні та питання для роздумів.', dlBtn1: 'Завантажити розбір',
    dlTitle: 'Завантажити розбір і бланк для записів',
    dlText: 'Гарний PDF із розбором без питань тесту: малюнки, описи, рекомендації, план на 4 тижні та питання для роздумів. Разом із ним завантажиться бланк для записів з усіма питаннями з розбору, щоб роздрукувати його й відповісти від руки.',
    dlBtn: 'Завантажити розбір і бланк', again: 'Пройти знову',
    wsTitle: 'Бланк для записів', wsText: 'Усі питання та кроки з твого розбору з місцем для відповідей. Його можна роздрукувати й заповнити від руки.', wsBtn: 'Завантажити бланк',
    matEyebrow: 'За бажанням', matTitle: 'Хочеш отримувати мої матеріали?',
    matText: 'Залиш ім’я та e-mail, і я надсилатиму корисні матеріали та розповідатиму про нові тести. Твої відповіді на тест залишаються тільки в тебе: мені прийдуть лише дані з цієї форми.',
    name: 'Ім’я *', email: 'E-mail *', tg: 'Telegram', tgPh: '@username', wa: 'WhatsApp', waPh: '+380 …',
    consent: link => `Я погоджуюся, що Ірина Вознесенська отримає дані з цієї форми, як описано в ${link} *`, consentLink: 'Політиці конфіденційності',
    news: 'Хочу отримувати листи з корисними матеріалами. Відписатися можна будь-коли.',
    adult: 'Мені є 18 років *', send: 'Надіслати',
    errName: 'Напиши, будь ласка, своє ім’я.', errEmail: 'Перевір e-mail: схоже, у ньому помилка.', errConsent: 'Щоб надіслати форму, потрібна згода.', errAdult: 'Цей тест призначений для людей від 18 років.',
    sent: 'Дякую! Дані надіслано.', sendFail: 'Не вдалося надіслати. Перевір інтернет і спробуй ще раз.',
    noLib: 'Не вдалося завантажити модуль PDF. Перевір інтернет і онови сторінку.',
    making: 'Готую PDF…', madeMain: 'Розбір збережено. Готую бланк для записів…',
    madeBoth: 'Готово! Збережено два файли: розбір і бланк для записів. Якщо вони не відкрилися, зазирни в папку «Завантаження».',
    madeOne: 'Розбір збережено. Якщо він не відкрився, зазирни в папку «Завантаження».',
    madeWsLater: 'Розбір збережено. Бланк для записів можна завантажити кнопкою нижче.',
    wsMaking: 'Готую бланк…', wsDone: 'Бланк збережено. Роздрукуй його й пиши від руки.', wsFail: 'Не вдалося підготувати бланк. Спробуй ще раз.',
    cancel: 'Збереження скасовано.', fail: 'Не вдалося підготувати PDF. Спробуй ще раз.',
    wsFile: 'Бланк для записів', wsFoot: ' · бланк для записів'
  },
  de: {
    dlTitle1: 'Auswertung herunterladen', dlText1: 'Ein schönes PDF mit deiner Auswertung, ohne die Testfragen: Bilder, Beschreibungen, Empfehlungen, ein Plan für 4 Wochen und Fragen zum Nachdenken.', dlBtn1: 'Auswertung herunterladen',
    dlTitle: 'Auswertung und Notizblatt herunterladen',
    dlText: 'Ein schönes PDF mit deiner Auswertung, ohne die Testfragen: Bilder, Beschreibungen, Empfehlungen, ein Plan für 4 Wochen und Fragen zum Nachdenken. Dazu wird ein Notizblatt mit allen Fragen aus der Auswertung heruntergeladen, zum Ausdrucken und Ausfüllen von Hand.',
    dlBtn: 'Auswertung und Notizblatt herunterladen', again: 'Noch einmal machen',
    wsTitle: 'Notizblatt', wsText: 'Alle Fragen und Schritte aus deiner Auswertung mit Platz für deine Antworten. Zum Ausdrucken und Ausfüllen von Hand.', wsBtn: 'Notizblatt herunterladen',
    matEyebrow: 'Freiwillig', matTitle: 'Möchtest du meine Materialien erhalten?',
    matText: 'Hinterlasse deinen Namen und deine E-Mail, dann schicke ich dir hilfreiche Materialien und erzähle dir von neuen Tests. Deine Antworten im Test bleiben nur bei dir: Ich erhalte nur die Angaben aus diesem Formular.',
    name: 'Name *', email: 'E-Mail *', tg: 'Telegram', tgPh: '@username', wa: 'WhatsApp', waPh: '+41 79 …',
    consent: link => `Ich bin einverstanden, dass Iryna Voznesenskaya die Angaben aus diesem Formular erhält, wie in der ${link} beschrieben *`, consentLink: 'Datenschutzerklärung',
    news: 'Ich möchte E-Mails mit hilfreichen Materialien erhalten. Abmelden ist jederzeit möglich.',
    adult: 'Ich bin mindestens 18 Jahre alt *', send: 'Senden',
    errName: 'Bitte gib deinen Namen ein.', errEmail: 'Bitte prüfe deine E-Mail-Adresse.', errConsent: 'Zum Senden brauche ich dein Einverständnis.', errAdult: 'Dieser Test ist für Personen ab 18 Jahren.',
    sent: 'Danke! Deine Angaben wurden gesendet.', sendFail: 'Das Senden hat nicht geklappt. Prüfe deine Internetverbindung und versuche es noch einmal.',
    noLib: 'Das PDF-Modul konnte nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite neu.',
    making: 'PDF wird erstellt…', madeMain: 'Auswertung gespeichert. Das Notizblatt wird erstellt…',
    madeBoth: 'Fertig! Zwei Dateien wurden gespeichert: die Auswertung und das Notizblatt. Falls sie sich nicht geöffnet haben, schau im Ordner «Downloads» nach.',
    madeOne: 'Auswertung gespeichert. Falls sie sich nicht geöffnet hat, schau im Ordner «Downloads» nach.',
    madeWsLater: 'Auswertung gespeichert. Das Notizblatt kannst du unten herunterladen.',
    wsMaking: 'Notizblatt wird erstellt…', wsDone: 'Notizblatt gespeichert. Druck es aus und schreib von Hand.', wsFail: 'Das Notizblatt konnte nicht erstellt werden. Versuche es noch einmal.',
    cancel: 'Speichern abgebrochen.', fail: 'Das PDF konnte nicht erstellt werden. Versuche es noch einmal.',
    wsFile: 'Notizblatt', wsFoot: ' · Notizblatt'
  },
  en: {
    dlTitle1: 'Download your results', dlText1: 'A beautiful PDF with your results, without the test questions: pictures, descriptions, recommendations, a 4-week plan and questions to reflect on.', dlBtn1: 'Download results',
    dlTitle: 'Download your results and notes sheet',
    dlText: 'A beautiful PDF with your results, without the test questions: pictures, descriptions, recommendations, a 4-week plan and questions to reflect on. A notes sheet with all the questions from your results is downloaded with it, to print out and answer by hand.',
    dlBtn: 'Download results and notes sheet', again: 'Take it again',
    wsTitle: 'Notes sheet', wsText: 'All the questions and steps from your results with space for your answers. Print it out and fill it in by hand.', wsBtn: 'Download notes sheet',
    matEyebrow: 'Optional', matTitle: 'Would you like to receive my materials?',
    matText: 'Leave your name and e-mail, and I will send you useful materials and tell you about new tests. Your test answers stay with you only: I only receive the details from this form.',
    name: 'Name *', email: 'E-mail *', tg: 'Telegram', tgPh: '@username', wa: 'WhatsApp', waPh: '+41 79 …',
    consent: link => `I agree that Iryna Voznesenskaya receives the details from this form, as described in the ${link} *`, consentLink: 'Privacy policy',
    news: 'I would like to receive e-mails with useful materials. I can unsubscribe at any time.',
    adult: 'I am 18 or older *', send: 'Send',
    errName: 'Please enter your name.', errEmail: 'Please check your e-mail address.', errConsent: 'Your consent is needed to send the form.', errAdult: 'This test is for people aged 18 and over.',
    sent: 'Thank you! Your details have been sent.', sendFail: 'Sending failed. Check your internet connection and try again.',
    noLib: 'The PDF module could not be loaded. Check your internet connection and reload the page.',
    making: 'Preparing the PDF…', madeMain: 'Results saved. Preparing the notes sheet…',
    madeBoth: 'Done! Two files have been saved: your results and the notes sheet. If they did not open, look in your Downloads folder.',
    madeOne: 'Results saved. If the file did not open, look in your Downloads folder.',
    madeWsLater: 'Results saved. You can download the notes sheet with the button below.',
    wsMaking: 'Preparing the notes sheet…', wsDone: 'Notes sheet saved. Print it out and write by hand.', wsFail: 'The notes sheet could not be prepared. Please try again.',
    cancel: 'Saving cancelled.', fail: 'The PDF could not be prepared. Please try again.',
    wsFile: 'Notes sheet', wsFoot: ' · notes sheet'
  }
};
const L = LT_ALL[PAGE_LANG] || LT_ALL.ru;
const HAS_WS = typeof worksheetBlocks === 'function';
const ASK_ADULT = (typeof BRAND !== 'undefined' && BRAND === 'psy');   // тесты о паре — только для взрослых

function leadFormHtml(){
  return `<div class="blk actions dl-box" style="margin-top:18px">
    <h3>${HAS_WS ? L.dlTitle : L.dlTitle1}</h3>
    <p>${HAS_WS ? L.dlText : L.dlText1}</p>
    <p class="err" id="formErr" hidden></p>
    <div class="row">
      <button class="btn" type="button" id="pdfBtn">${HAS_WS ? L.dlBtn : L.dlBtn1}</button>
      <button class="btn ghost" type="button" id="again">${L.again}</button>
    </div>
    ${HAS_WS ? `<div class="ws-offer" id="wsOffer" hidden><b>${L.wsTitle}</b><span>${L.wsText}</span><button class="btn" type="button" id="wsBtn">${L.wsBtn}</button></div>` : ''}
    <span class="status" id="status" hidden></span>
    <p class="note keep" id="keepLine"></p>
    ${deleteAnswersHtml()}
  </div>
  <div class="blk mat-box">
    <div class="eyebrow">${L.matEyebrow}</div><h3>${L.matTitle}</h3>
    <p>${L.matText}</p>
    <form id="lead" class="stack" style="gap:12px" novalidate>
      <div class="row" style="align-items:stretch">
        <div class="field"><label for="fName">${L.name}</label><input id="fName" maxlength="40" autocomplete="given-name"></div>
        <div class="field"><label for="fEmail">${L.email}</label><input id="fEmail" type="email" maxlength="80" autocomplete="email"></div>
      </div>
      <div class="row" style="align-items:stretch">
        <div class="field"><label for="fTg">${L.tg}</label><input id="fTg" maxlength="40" placeholder="${L.tgPh}" autocomplete="off"></div>
        <div class="field"><label for="fWa">${L.wa}</label><input id="fWa" type="tel" maxlength="25" placeholder="${L.waPh}" autocomplete="tel"></div>
      </div>
      <label class="check"><input type="checkbox" id="fConsent"> <span>${L.consent(`<a href="${legalUrl('privacy')}" target="_blank" rel="noopener">${L.consentLink}</a>`)}</span></label>
      <label class="check"><input type="checkbox" id="fNews"> <span>${L.news}</span></label>
      ${ASK_ADULT ? `<label class="check"><input type="checkbox" id="fAdult"> <span>${L.adult}</span></label>` : ''}
      <p class="err" id="matErr" hidden></p>
      <div class="row"><button class="btn" type="submit" id="matBtn">${L.send}</button></div>
      <p class="note" id="matOk" hidden></p>
    </form>
  </div>`;
}
document.querySelectorAll('[data-lead]').forEach(el => el.innerHTML = leadFormHtml());

const el = id => document.getElementById(id);
function setStatus(t){ el('status').textContent = t; el('status').hidden = !t; }
function setErr(t){ el('formErr').textContent = t; el('formErr').hidden = !t; }
el('again').addEventListener('click', () => { el('result').hidden = true; el('intro').hidden = false; window.scrollTo(0,0); });

/* прежняя анкета хранила контакты; теперь браузер помнит только страну (в мини-опросе) */
function loadLead(){ return { country: surveyCountry(), name: (LEAD_HOOKS.personName && LEAD_HOOKS.personName()) || '' }; }

const _showResult = showResult;
showResult = function(){
  _showResult();
  setErr(''); setStatus('');
  if (el('wsOffer')) el('wsOffer').hidden = true;
  el('keepLine').textContent = retentionLine();
  if (!el('fName').value) el('fName').value = (LEAD_HOOKS.personName && LEAD_HOOKS.personName()) || '';
};

// Чёткость PDF: 3 = около 290 точек на дюйм (хорошо для печати). На слабых телефонах — 2.5.
const PDF_SCALE = (/iPhone|iPad|Android/i.test(navigator.userAgent) && (navigator.deviceMemory || 4) < 4) ? 2.5 : 3;
async function buildPdf(getBlocks = buildBlocks, foot = null){
  const stage = el('stage'); stage.innerHTML = '';
  window.__PDF = true; let blocks; try { blocks = getBlocks(); } finally { window.__PDF = false; }
  const footText = foot || footerLine();
  /* номер файла для «Реестра документов»: галочка перед скачиванием, assets/skachivanie.js (10.10.2026) */
  const docNo = (window.SVLDOC && window.SVLDOC.issue) ? (window.SVLDOC.issue('PDF', TEST_META.id + (foot ? ' · бланк' : ' · разбор')), window.SVLDOC.label(PAGE_LANG)) : '';
  const pages = [];
  const newPage = () => {
    const p = document.createElement('div'); p.className = 'pdf-page';
    p.innerHTML = `<div class="strip"></div><div class="pbody"></div><div class="pfoot"><span>${footText}</span><span class="pn"></span></div>`;
    stage.appendChild(p); pages.push(p); return p.querySelector('.pbody');
  };
  let body = newPage();
  const mk = b => { const h = document.createElement('div'); h.innerHTML = b.html; return h.firstElementChild; };
  const over = () => body.scrollHeight > body.clientHeight + 1;
  const used = new Set();
  for (let i = 0; i < blocks.length; i++){
    const b = blocks[i];
    if (!b.html || used.has(i)) continue;
    if (b.newPage && body.children.length) body = newPage();
    const node = mk(b);
    body.appendChild(node);
    if (over() && body.children.length > 1){
      node.remove();
      // свободное место внизу страницы заполняем небольшими «плавающими» блоками, которые идут дальше (float: true)
      for (let j = i + 1; j < blocks.length; j++){
        if (!blocks[j].float || used.has(j) || !blocks[j].html) continue;
        const f = mk(blocks[j]); body.appendChild(f);
        if (over()) f.remove(); else used.add(j);
      }
      body = newPage(); body.appendChild(node);
    }
    if (body.scrollHeight > body.clientHeight + 1 && body.children.length === 1){   // один блок выше страницы — уменьшаем, чтобы ничего не обрезалось
      const k = body.clientHeight / node.scrollHeight;
      node.style.transformOrigin = 'top left'; node.style.transform = `scale(${k})`; node.style.width = (100 / k) + '%';
    }
  }
  pages.forEach((p, i) => p.querySelector('.pn').textContent = `${i+1} / ${pages.length}` + (docNo ? ' · ' + docNo : ''));
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:'pt', format:'a4', compress:true });
  for (let i = 0; i < pages.length; i++){
    const canvas = await html2canvas(pages[i], { scale:PDF_SCALE, backgroundColor:'#FFFFFF', useCORS:true, logging:false });
    (function(cv, t){ const c = cv.getContext('2d'), w = cv.width, h = cv.height, fs = Math.round(Math.max(w, h) * 0.032); c.save(); c.font = '700 ' + fs + 'px Manrope, sans-serif'; c.fillStyle = 'rgba(110,79,60,0.075)'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.translate(w / 2, h / 2); c.rotate(-Math.PI / 7); const sx = fs * 9, sy = fs * 5, R = Math.hypot(w, h) / 2 + sx; for (let y = -R, r = 0; y <= R; y += sy, r++) for (let x = -R + (r % 2) * sx / 2; x <= R; x += sx) c.fillText(t, x, y); c.restore(); })(canvas, 'voznesenskaya.ch');
    if (i) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 595.28, 841.89, undefined, 'FAST');
    const pr = pages[i].getBoundingClientRect(), k = 595.28 / pr.width;
    pages[i].querySelectorAll('a[href]').forEach(a => {
      if (!/^https?:/.test(a.href)) return;
      const r = a.getBoundingClientRect();
      pdf.link((r.left - pr.left) * k, (r.top - pr.top) * k, r.width * k, r.height * k, { url: a.href });
    });
  }
  stage.innerHTML = '';
  return pdf.output('blob');
}

let downloadsCap = null;
(async () => { try { if (window.claude && window.claude.use) downloadsCap = await window.claude.use('downloads'); } catch(e){ downloadsCap = null; } })();
async function saveBlob(blob, filename){
  if (downloadsCap){ await downloadsCap.save({ filename, data: blob }); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.rel = 'noopener'; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1000);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
const cleanName = s => s.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();

/* ---------- отправка в таблицу: без результатов теста ---------- */
function basePayload(){
  const src = new URLSearchParams(location.search);
  const sv = (typeof surveyAnswers === 'function') ? surveyAnswers() : { heard: [], interest: [] };
  return {
    testId: TEST_META.id, testName: TEST_META.name, lang: PAGE_LANG, country: surveyCountry(),
    heard: sv.heard.join(', '), interest: sv.interest.join(', '),
    source: src.get('utm_source') || src.get('src') || document.referrer || 'прямой заход'
  };
}
async function post(payload){
  if (!ENDPOINT) return;
  await fetch(ENDPOINT, { method:'POST', mode:'no-cors', headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
}
let statSent = false;
async function sendStat(){       // анонимно: без имени, e-mail и результатов; один раз за открытие разбора
  if (statSent) return; statSent = true;
  try { await post({ kind: 'stat', ...basePayload() }); } catch(e){}
}

/* ---------- скачать разбор и бланк ---------- */
el('pdfBtn').addEventListener('click', async () => {
  setErr('');
  if (!window.jspdf || !window.html2canvas) return setErr(L.noLib);
  const btn = el('pdfBtn'); btn.disabled = true; setStatus(L.making);
  try {
    sendStat();
    const blob = await buildPdf();
    const fname = cleanName([TEST_META.name, ...LEAD_HOOKS.fileNames(), new Date().toLocaleDateString(DATE_LOCALE)].filter(Boolean).join(' — '));
    await saveBlob(blob, fname + '.pdf');
    if (!HAS_WS){ setStatus(L.madeOne); return; }
    el('wsOffer').hidden = false;
    setStatus(L.madeMain);
    try { await downloadWorksheet(); setStatus(L.madeBoth); }
    catch(e2){ setStatus(L.madeWsLater); }
  } catch(e){
    setStatus('');
    setErr(e && e.code === 'declined' ? L.cancel : L.fail);
  } finally { btn.disabled = false; }
});
async function downloadWorksheet(){
  const nm = (LEAD_HOOKS.personName && LEAD_HOOKS.personName()) || '';
  const pair = (typeof WS_PAIR !== 'undefined') ? WS_PAIR : TEST_META.id === 'roza-lyubvi';
  const blob = await buildPdf(() => { buildBlocks(); return worksheetBlocks({ name: nm, pair }); }, footerLine() + L.wsFoot);
  const fname = cleanName([L.wsFile, TEST_META.name, nm, new Date().toLocaleDateString(DATE_LOCALE)].filter(Boolean).join(' — '));
  await saveBlob(blob, fname + '.pdf');
}
if (el('wsBtn')) el('wsBtn').addEventListener('click', async () => {
  const b = el('wsBtn'); b.disabled = true; setErr(''); setStatus(L.wsMaking);
  try { await downloadWorksheet(); setStatus(L.wsDone); }
  catch(e){ setStatus(''); setErr(e && e.code === 'declined' ? L.cancel : L.wsFail); }
  finally { b.disabled = false; }
});

/* ---------- форма «Хочешь получать мои материалы?» (по желанию) ---------- */
el('lead').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const err = t => { el('matErr').textContent = t; el('matErr').hidden = !t; };
  err(''); el('matOk').hidden = true;
  const lead = { name: el('fName').value.trim(), email: el('fEmail').value.trim(), telegram: el('fTg').value.trim(), whatsapp: el('fWa').value.trim(),
                 marketing: el('fNews').checked, consent: el('fConsent').checked, adult: ASK_ADULT ? el('fAdult').checked : null };
  if (!lead.name) return err(L.errName);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) return err(L.errEmail);
  if (!lead.consent) return err(L.errConsent);
  if (ASK_ADULT && !lead.adult) return err(L.errAdult);
  const b = el('matBtn'); b.disabled = true;
  try {
    await post({ kind: 'lead', ...basePayload(), ...lead });
    el('matOk').textContent = L.sent; el('matOk').hidden = false;
    el('lead').querySelectorAll('input').forEach(i => { if (i.type === 'checkbox') i.checked = false; else if (i.id !== 'fName') i.value = ''; });
  } catch(e){ err(L.sendFail); }
  finally { b.disabled = false; }
});
window.__buildPdf = buildPdf;
