/* «Договоры коучинга» voznesenskaya.ch — Google Apps Script (решение Ирины 10.10.2026, документ проекта «dogovor-kouchinga.md»).
   Страница https://voznesenskaya.ch/dogovor/ присылает сюда подписанный договор. Скрипт:
   1) записывает строку в таблицу «Договоры коучинга — voznesenskaya.ch» (лист года);
   2) делает PDF договора (то, что человек видел на экране, вместе с «Условиями работы со мной») и кладёт его в папку на Google Диске;
   3) отправляет человеку письмо с копией договора с адреса voznesenskaya.iryna@gmail.com;
   4) отправляет Ирине письмо с данными и кнопкой «Подтвердить договор». После подтверждения человеку уходит письмо «Договор вступил в силу».
   Скрипт только записывает: прочитать таблицу через адрес сайта нельзя. ID таблицы и папки хранятся в свойствах скрипта, не в коде.

   КАК ПОСТАВИТЬ (один раз): script.google.com → «Новый проект» → вставить этот файл → сохранить → выбрать функцию «ustanovka» → «Выполнить»
   и разрешить доступ (Таблицы, Диск, Gmail, внешние запросы). Потом «Начать развертывание» → «Новое развертывание» → «Веб-приложение»,
   «Выполнять от имени»: Я, «У кого есть доступ»: Все → скопировать адрес …/exec в ENDPOINT в dogovor/index.html.
   Если скрипт меняется: «Управление развертываниями» → карандаш → «Версия: новая» → «Развернуть» (адрес не меняется). */

var TZ = 'Europe/Zurich';
var SITE = 'https://voznesenskaya.ch';
var FROM = 'voznesenskaya.iryna@gmail.com';
var FROM_NAME = 'Ирина Вознесенская · Alonira.ch AG';
var LANGS = { ru: 1, uk: 1, de: 1, en: 1 };
var PROGS = { mentor: 150, snimok: 249, fund: 249, life: 249, flag: 0, support: 0, other: 0 };
var REPORT = { snimok: 1, fund: 1, life: 1 };
var REP_PRICE = 29;
var RX_NO = /^KV-(\d{4})(\d{2})(\d{2})-[2-9A-HJKMNP-Z]{4}$/;
var MAX_DAY = 40;          // договоров в день — больше быть не может, защита от злоупотреблений
var MAX_PER_EMAIL = 3;     // с одного e-mail за 6 часов
var HEAD = ['Номер', 'Подписан (Цюрих)', 'Подписан на устройстве', 'Часовой пояс', 'Статус', 'Подтверждён (Цюрих)', 'Язык', 'Программа (код)', 'Программа', 'Формат',
  'По предложению', 'Цена CHF', 'Отчёт 29 CHF', 'Итого CHF', 'Оплата', 'Имя', 'E-mail', 'Telegram или телефон', 'Страна', 'Город', 'Адрес', 'Пожелания',
  'ЕС/ЕЭЗ', 'Начать раньше 14 дней', '18+', 'Не терапия', 'Заметки', 'Запись для отчёта', 'Условия приняты', 'Редакция условий', 'Версия условий',
  'Контрольная сумма', 'Проверка', 'PDF', 'Ключ подтверждения'];

function props(){ return PropertiesService.getScriptProperties(); }
function book(){ return SpreadsheetApp.openById(props().getProperty('SHEET_ID')); }
function folder(){ return DriveApp.getFolderById(props().getProperty('FOLDER_ID')); }
function yearSheet(ss, y){
  var sh = ss.getSheetByName(String(y));
  if (!sh){ sh = ss.insertSheet(String(y), 0); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold'); sh.setColumnWidth(1, 170); sh.setColumnWidth(9, 220); sh.setColumnWidth(16, 180); sh.setColumnWidth(17, 200); }
  return sh;
}

/* ---------- установка ---------- */
function ustanovka(){
  var p = props();
  if (!p.getProperty('FOLDER_ID')){ var f = DriveApp.createFolder('Договоры коучинга — voznesenskaya.ch'); p.setProperty('FOLDER_ID', f.getId()); }
  if (!p.getProperty('SHEET_ID')){
    var ss = SpreadsheetApp.create('Договоры коучинга — voznesenskaya.ch');
    DriveApp.getFileById(ss.getId()).moveTo(folder());
    p.setProperty('SHEET_ID', ss.getId());
    var info = ss.getSheets()[0]; info.setName('Как устроено');
    info.getRange(1, 1, 6, 1).setValues([['Договоры о коучинге, подписанные на https://voznesenskaya.ch/dogovor/ (с 10.10.2026).'],
      ['Каждый договор — строка в листе года. PDF того, что человек видел и подписал, лежит в папке «Договоры коучинга — voznesenskaya.ch».'],
      ['Статус «подписан» — ждёт подтверждения Ирины (кнопка в письме). «подтверждён» — договор действует, человеку ушло письмо.'],
      ['Если договор принять нельзя — ответить человеку письмом и поставить статус «отклонён» вручную.'],
      ['Хранить 10 лет (деловые документы). Данные — только для договора и доказательства, о чём договорились.'],
      ['Скрипт: проект Apps Script «Договоры коучинга — скрипт»; исходник в репозитории tests, _i18n/dogovor/dogovory-kouchinga.gs.']]);
    info.setColumnWidth(1, 900);
  }
  yearSheet(book(), new Date().getFullYear());
  p.setProperty('OWNER', Session.getEffectiveUser().getEmail());
  var ok = GmailApp.getAliases().indexOf(FROM) >= 0;
  p.setProperty('ALIAS_OK', ok ? '1' : '0');
  Logger.log('Таблица: ' + book().getUrl() + ' · псевдоним ' + FROM + ': ' + (ok ? 'есть' : 'НЕТ — письма уйдут с основного адреса'));
}

/* ---------- помощники ---------- */
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean(v, n){ return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b-\u001f]/g, ' ').replace(/^[=+\-@]/, "'$&").slice(0, n); }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function plain(html){ return String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim(); }
var OK_TAGS = { header: 1, h2: 1, h3: 1, h4: 1, p: 1, b: 1, strong: 1, em: 1, i: 1, ul: 1, ol: 1, li: 1, table: 1, tbody: 1, tr: 1, td: 1, th: 1, br: 1, div: 1, section: 1, span: 1, small: 1 };
/* то, что прислала страница, превращаем в безопасный текст: только простые теги, без ссылок, картинок и скриптов */
function sanitize(html){
  var s = String(html || '').slice(0, 120000);
  s = s.replace(/<(script|style|iframe|object|embed|svg|math|template|noscript)[\s\S]*?<\/\1\s*>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, function(m, tag, attrs){
    tag = tag.toLowerCase(); if (!OK_TAGS[tag]) return '';
    if (m.charAt(1) === '/') return '</' + tag + '>';
    var c = /\sclass="([a-z0-9 -]{1,60})"/i.exec(attrs || '');
    return '<' + tag + (c ? ' class="' + c[1] + '"' : '') + '>';
  });
  s = s.replace(/https?:\/\/[^\s<"]+/gi, function(u){ return /^https?:\/\/(www\.)?(voznesenskaya\.ch|svoiludi\.ch|t\.me\/IrynaNeuroCoach)(\/|$)/i.test(u) ? u : '[ссылка удалена]'; });
  return s;
}
function termsText(lang){
  var key = 'terms:' + lang, c = CacheService.getScriptCache().get(key);
  if (c) return c;
  var t = UrlFetchApp.fetch(SITE + '/usloviya/' + lang + '.js?nocache=' + Date.now(), { muteHttpExceptions: true }).getContentText();
  var b = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)).body;
  b = b.replace(/<style[\s\S]*?<\/style>/gi, '');
  var i = b.indexOf('<h2'); var txt = plain(i >= 0 ? b.slice(i) : b);
  try { CacheService.getScriptCache().put(key, txt, 600); } catch (e) {}
  return txt;
}
function fmtNow(d){ return Utilities.formatDate(d || new Date(), TZ, 'dd.MM.yyyy HH:mm:ss'); }

/* ---------- письма на языке договора ---------- */
var T = {
  ru: { s1: 'Договор о коучинге № {no}: копия', b1: 'Здравствуй, {name}!\n\nСпасибо, договор о коучинге № {no} подписан {date}. Его копия — во вложении (PDF).\nПрограмма: {prog}. Итого: {total} CHF.\n\nДоговор вступает в силу, когда я подтверждаю его письмом, обычно в течение двух рабочих дней. Потом приходит счёт от Alonira.ch AG с QR-квитанцией, и мы договариваемся о первой встрече.\n\nЕсли договор подписывала не ты или в нём что-то не так, просто ответь на это письмо.\n\nИрина Вознесенская\nкоуч, Alonira.ch AG · https://voznesenskaya.ch',
    s2: 'Договор о коучинге № {no} вступил в силу', b2: 'Здравствуй, {name}!\n\nЯ подтверждаю договор о коучинге № {no} от {date}. С сегодняшнего дня, {today}, он действует.\nПрограмма: {prog}. Итого: {total} CHF.\n\nЧто дальше: счёт от Alonira.ch AG с QR-квитанцией придёт отдельным письмом, а время первой встречи мы согласуем в переписке.{eu}\n\nДо встречи!\nИрина Вознесенская\nкоуч, Alonira.ch AG · https://voznesenskaya.ch',
    eu: '\n\nТы живёшь в стране Евросоюза или Европейской экономической зоны: 14 дней на отказ от договора считаются с сегодняшнего дня.' },
  uk: { s1: 'Договір про коучинг № {no}: копія', b1: 'Привіт, {name}!\n\nДякую, договір про коучинг № {no} підписано {date}. Його копія — у вкладенні (PDF).\nПрограма: {prog}. Разом: {total} CHF.\n\nДоговір набирає чинності, коли я підтверджую його листом, зазвичай протягом двох робочих днів. Потім надходить рахунок від Alonira.ch AG з QR-квитанцією, і ми домовляємося про першу зустріч.\n\nЯкщо договір підписувала не ти або в ньому щось не так, просто дай відповідь на цей лист.\n\nІрина Вознесенська\nкоуч, Alonira.ch AG · https://voznesenskaya.ch/uk/',
    s2: 'Договір про коучинг № {no} набрав чинності', b2: 'Привіт, {name}!\n\nЯ підтверджую договір про коучинг № {no} від {date}. Від сьогодні, {today}, він діє.\nПрограма: {prog}. Разом: {total} CHF.\n\nЩо далі: рахунок від Alonira.ch AG з QR-квитанцією прийде окремим листом, а час першої зустрічі ми погодимо в листуванні.{eu}\n\nДо зустрічі!\nІрина Вознесенська\nкоуч, Alonira.ch AG · https://voznesenskaya.ch/uk/',
    eu: '\n\nТи живеш у країні Євросоюзу або Європейської економічної зони: 14 днів на відмову від договору рахуються від сьогодні.' },
  de: { s1: 'Coaching-Vertrag Nr. {no}: deine Kopie', b1: 'Hallo {name}\n\nDanke, der Coaching-Vertrag Nr. {no} wurde am {date} unterschrieben. Die Kopie findest du im Anhang (PDF).\nProgramm: {prog}. Total: {total} CHF.\n\nDer Vertrag tritt in Kraft, wenn ich ihn per E-Mail bestätige, in der Regel innerhalb von zwei Arbeitstagen. Danach kommt die Rechnung der Alonira.ch AG mit QR-Einzahlungsschein, und wir vereinbaren das erste Treffen.\n\nWenn du den Vertrag nicht selbst unterschrieben hast oder etwas nicht stimmt, antworte einfach auf diese E-Mail.\n\nIryna Voznesenskaya\nCoach, Alonira.ch AG · https://voznesenskaya.ch/de/',
    s2: 'Coaching-Vertrag Nr. {no} ist in Kraft', b2: 'Hallo {name}\n\nIch bestätige den Coaching-Vertrag Nr. {no} vom {date}. Ab heute, {today}, gilt er.\nProgramm: {prog}. Total: {total} CHF.\n\nWie es weitergeht: Die Rechnung der Alonira.ch AG mit QR-Einzahlungsschein kommt mit einer separaten E-Mail, den Termin für das erste Treffen vereinbaren wir per Nachricht.{eu}\n\nBis bald!\nIryna Voznesenskaya\nCoach, Alonira.ch AG · https://voznesenskaya.ch/de/',
    eu: '\n\nDu wohnst in einem Land der EU oder des Europäischen Wirtschaftsraums: Die 14-tägige Widerrufsfrist beginnt heute.' },
  en: { s1: 'Coaching agreement No. {no}: your copy', b1: 'Hello {name},\n\nThank you, coaching agreement No. {no} was signed on {date}. Your copy is attached (PDF).\nProgramme: {prog}. Total: {total} CHF.\n\nThe agreement comes into force when I confirm it by e-mail, usually within two working days. After that, you receive the invoice from Alonira.ch AG with a QR payment slip, and we arrange the first session.\n\nIf you did not sign this agreement yourself or something is wrong, simply reply to this e-mail.\n\nIryna Voznesenskaya\nCoach, Alonira.ch AG · https://voznesenskaya.ch/en/',
    s2: 'Coaching agreement No. {no} is now in force', b2: 'Hello {name},\n\nI confirm coaching agreement No. {no} of {date}. From today, {today}, it is in force.\nProgramme: {prog}. Total: {total} CHF.\n\nWhat happens next: the invoice from Alonira.ch AG with a QR payment slip comes in a separate e-mail, and we will agree on the time of the first session by message.{eu}\n\nSee you soon!\nIryna Voznesenskaya\nCoach, Alonira.ch AG · https://voznesenskaya.ch/en/',
    eu: '\n\nYou live in a country of the EU or the European Economic Area: the 14-day period for withdrawing from the agreement starts today.' }
};
function fill(t, o){ return t.replace(/\{(\w+)\}/g, function(m, k){ return o[k] != null ? String(o[k]) : ''; }); }
function send(to, subject, body, opts){
  opts = opts || {}; opts.name = FROM_NAME; opts.replyTo = FROM;
  if (props().getProperty('ALIAS_OK') === '1') opts.from = FROM;
  GmailApp.sendEmail(to, subject, body, opts);
}

/* ---------- PDF ---------- */
var CSS = 'body{font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;line-height:1.45;color:#2F2924}h2{font-size:20pt;color:#6E4F3C;font-weight:normal;margin:4px 0}h3{font-size:11pt;margin:14px 0 4px}h4{font-size:14pt;color:#6E4F3C;font-weight:normal;margin:16px 0 6px}' +
  'table{border-collapse:collapse;width:100%}td{border-top:1px solid #E5D9C9;padding:5px 8px 5px 0;vertical-align:top}tr.sum td{font-weight:bold}.doc-eb{font-size:8pt;letter-spacing:1px;text-transform:uppercase;color:#7A6E62}' +
  '.doc-h{border-bottom:2px solid #6E4F3C;padding-bottom:8px;margin-bottom:6px}.formbox{border:1px dashed #B4A796;padding:8px 10px}.sig{border:1.5px solid #6E4F3C;padding:8px 10px;background:#F4EDE3}.terms{border-top:2px solid #6E4F3C;margin-top:14px}.terms h2{font-size:11pt;color:#2F2924;font-weight:bold}';
function makePdf(r, html){
  var sig = '<p class="sig">' + fill({ ru: 'Подписано электронно: <b>{n}</b>, {e}, {d} ({tz}). Получено сервером Alonira.ch AG: {srv} (Цюрих). Контрольная сумма текста: {h}.', uk: 'Підписано електронно: <b>{n}</b>, {e}, {d} ({tz}). Отримано сервером Alonira.ch AG: {srv} (Цюрих). Контрольна сума тексту: {h}.', de: 'Elektronisch unterschrieben: <b>{n}</b>, {e}, {d} ({tz}). Beim Server der Alonira.ch AG eingegangen: {srv} (Zürich). Prüfsumme des Textes: {h}.', en: 'Signed electronically: <b>{n}</b>, {e}, {d} ({tz}). Received by the Alonira.ch AG server: {srv} (Zurich). Text checksum: {h}.' }[r.lang],
    { n: esc(r.name), e: esc(r.email), d: esc(r.signedLocal), tz: esc(r.tz), srv: fmtNow(r.received), h: esc(String(r.hash).slice(0, 16)) }) + '</p>';
  /* подпись в присланном тексте — заглушка «Здесь появятся…»: заменяем её строкой подписи с данными сервера */
  var body = html.replace(/<p class="sig">[\s\S]*?<\/p>/, sig);
  var doc = '<html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>' + body + '</body></html>';
  var blob = Utilities.newBlob(doc, 'text/html', 'dogovor.html').getAs('application/pdf');
  blob.setName('Договор о коучинге ' + r.no + ' — ' + r.name.replace(/[\\/:*?"<>|]/g, ' ') + '.pdf');
  var file = folder().createFile(blob);
  return { blob: blob, url: file.getUrl() };
}

/* ---------- приём договора ---------- */
function doPost(e){
  try {
    var d = JSON.parse(e && e.postData && e.postData.contents || '{}');
    if (d.kind !== 'contract') return json({ ok: false, err: 'kind' });
    if (d.website) return json({ ok: true });                       // поле-ловушка для роботов
    var m = RX_NO.exec(String(d.no || ''));
    if (!m || !LANGS[d.lang] || !(d.prog in PROGS)) return json({ ok: false, err: 'data' });
    var email = String(d.email || '').trim().slice(0, 120), name = clean(d.name, 100).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || name.length < 3) return json({ ok: false, err: 'data' });
    var c = d.consents || {};
    if (!c.adult || !c.coach || !c.notes || !c.terms || (d.report && !c.rec)) return json({ ok: false, err: 'consents' });
    var cache = CacheService.getScriptCache(), day = Utilities.formatDate(new Date(), TZ, 'yyyyMMdd'), ek = 'e:' + email.toLowerCase();
    var nd = +(cache.get('d:' + day) || 0), ne = +(cache.get(ek) || 0);
    if (nd >= MAX_DAY || ne >= MAX_PER_EMAIL) return json({ ok: false, err: 'limit' });

    var lock = LockService.getScriptLock(); lock.waitLock(25000);
    try {
      var ss = book(), sh = yearSheet(ss, m[1]);
      if (sh.createTextFinder(d.no).matchEntireCell(true).findNext()) return json({ ok: true, dup: true });
      var flags = [], fixed = PROGS[d.prog];
      var price = Math.round(Number(d.price) || 0), rep = !!(d.report && REPORT[d.prog]), total = price + (rep ? REP_PRICE : 0);
      if (fixed && price !== fixed) flags.push('цена не совпадает с сайтом (' + fixed + ' CHF)');
      if (!fixed && price <= 0) flags.push('нет цены');
      if (Math.round(Number(d.total) || 0) !== total) flags.push('итог пересчитан');
      var html = sanitize(d.html), terms = '';
      try { terms = termsText(d.lang); } catch (err){ flags.push('условия не загрузились'); }
      /* сравниваем без пробелов: теги ссылок рядом с кавычками дают лишние пробелы, смысл текста от этого не меняется */
      var termsOk = terms && plain(html).replace(/\s+/g, '').indexOf(terms.replace(/\s+/g, '').slice(0, 3000)) >= 0;
      if (terms && !termsOk) flags.push('текст условий не совпал с сайтом — человеку письмо не отправлено');
      var r = { no: d.no, lang: d.lang, name: name, email: email, signedLocal: clean(d.signedLocal, 60), tz: clean(d.tz, 60), hash: clean(d.hash, 64), received: new Date() };
      var pdf = makePdf(r, html);
      var key = Utilities.getUuid().replace(/-/g, '');
      var payTxt = { full: 'сразу всю сумму', parts: 'частями', prepay: 'заранее, целиком' }[d.pay] || clean(d.pay, 20);
      sh.appendRow([d.no, fmtNow(r.received), clean(d.signedAt, 40), r.tz, 'подписан', '', d.lang, d.prog, clean(d.progName, 120), clean(d.format, 160),
        d.offer ? 'да' : '', price, rep ? 'да' : '', total, payTxt, name, email, clean(d.contact, 80), clean(d.countryName, 80) + ' (' + clean(d.country, 3) + ')',
        clean(d.city, 80), clean(d.addr, 140), clean(d.comment, 600), d.eu ? 'да' : '', d.eu ? (c.early ? 'да' : 'нет') : '', 'да', 'да', 'да', rep ? 'да' : '', 'да',
        clean(d.termsEdition, 120), clean(d.termsVer, 20), r.hash, flags.join('; ') || 'ок', pdf.url, key]);
      cache.put('d:' + day, String(nd + 1), 21600); cache.put(ek, String(ne + 1), 21600);
    } finally { lock.releaseLock(); }

    var L = T[d.lang], o = { no: d.no, name: name, date: r.signedLocal, prog: clean(d.progName, 120), total: total };
    if (termsOk) send(email, fill(L.s1, o), fill(L.b1, o), { attachments: [pdf.blob] });
    var url = ScriptApp.getService().getUrl() + '?a=ok&n=' + encodeURIComponent(d.no) + '&k=' + key;
    var owner = props().getProperty('OWNER') || Session.getEffectiveUser().getEmail();
    GmailApp.sendEmail(owner, 'Договор о коучинге ' + d.no + ' — ' + name + ', ' + clean(d.progName, 80) + ', ' + total + ' CHF' + (flags.length ? ' — ПРОВЕРИТЬ' : ''),
      'Новый договор о коучинге с сайта voznesenskaya.ch/dogovor/.\n\n' +
      'Номер: ' + d.no + '\nПодписан: ' + r.signedLocal + ' (' + r.tz + '), получен ' + fmtNow(r.received) + '\nЯзык: ' + d.lang +
      '\nПрограмма: ' + clean(d.progName, 120) + (d.offer ? ' (по твоему предложению)' : '') + '\nЦена: ' + price + ' CHF' + (rep ? ' + отчёт 29 CHF' : '') + ' = ' + total + ' CHF\nОплата: ' + payTxt +
      '\n\nИмя: ' + name + '\nE-mail: ' + email + '\nTelegram или телефон: ' + clean(d.contact, 80) + '\nСтрана: ' + clean(d.countryName, 80) + (d.eu ? ' — ЕС/ЕЭЗ, 14 дней на отказ; начать раньше: ' + (c.early ? 'да' : 'нет, первая встреча после 14 дней') : '') +
      '\nГород: ' + clean(d.city, 80) + (d.addr ? '\nАдрес: ' + clean(d.addr, 140) : '') + (d.comment ? '\nПожелания: ' + clean(d.comment, 600) : '') +
      '\n\nПроверка: ' + (flags.join('; ') || 'всё в порядке') + (termsOk ? '\nКопия договора отправлена человеку.' : '\nКопия человеку НЕ отправлена.') +
      '\nPDF: ' + pdf.url +
      '\n\nПодтвердить договор (после этого человеку уходит письмо «Договор вступил в силу»):\n' + url +
      '\n\nЕсли договор принять нельзя — ответь человеку письмом сама и поставь в таблице статус «отклонён».',
      { attachments: [pdf.blob], name: 'Договоры коучинга · voznesenskaya.ch' });
    return json({ ok: true });
  } catch (err){
    return json({ ok: false, err: 'server' });
  }
}

/* ---------- подтверждение Ириной ---------- */
function doGet(e){
  var p = (e && e.parameter) || {};
  if (p.a !== 'ok' || !RX_NO.test(String(p.n || ''))) return HtmlService.createHtmlOutput('<p style="font-family:sans-serif">Договоры коучинга voznesenskaya.ch.</p>');
  var t = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:40px auto;line-height:1.5"><h2 style="font-weight:normal;color:#6E4F3C">Подтвердить договор ' + esc(p.n) + '?</h2>' +
    '<p>После подтверждения договор действует, а человеку уходит письмо «Договор вступил в силу».</p>' +
    '<button id="b" style="font-size:16px;padding:12px 22px;border:0;border-radius:12px;background:#4F5E3E;color:#fff;cursor:pointer">Подтвердить договор</button><p id="m"></p>' +
    '<script>document.getElementById("b").onclick=function(){this.disabled=true;document.getElementById("m").textContent="Подтверждаю…";' +
    'google.script.run.withSuccessHandler(function(t){document.getElementById("m").textContent=t;}).withFailureHandler(function(){document.getElementById("m").textContent="Не получилось. Попробуй ещё раз.";document.getElementById("b").disabled=false;})' +
    '.podtverdit(' + JSON.stringify(String(p.n)) + ',' + JSON.stringify(String(p.k || '')) + ');};</script></div>');
  return t.setTitle('Подтвердить договор');
}
function podtverdit(no, key){
  var m = RX_NO.exec(String(no)); if (!m) return 'Неверный номер договора.';
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var sh = yearSheet(book(), m[1]), cell = sh.createTextFinder(no).matchEntireCell(true).findNext();
    if (!cell) return 'Договор ' + no + ' не найден.';
    var row = cell.getRow(), v = sh.getRange(row, 1, 1, HEAD.length).getValues()[0];
    if (!key || v[HEAD.indexOf('Ключ подтверждения')] !== key) return 'Ссылка неверная. Открой её из письма о договоре.';
    if (v[HEAD.indexOf('Статус')] === 'подтверждён') return 'Договор ' + no + ' уже подтверждён ' + v[HEAD.indexOf('Подтверждён (Цюрих)')] + '.';
    var now = new Date();
    sh.getRange(row, HEAD.indexOf('Статус') + 1, 1, 2).setValues([['подтверждён', fmtNow(now)]]);
    var lang = v[HEAD.indexOf('Язык')], L = T[lang] || T.ru, eu = v[HEAD.indexOf('ЕС/ЕЭЗ')] === 'да';
    var loc = { ru: 'ru', uk: 'uk', de: 'de', en: 'en' }[lang] || 'ru';
    var today = Utilities.formatDate(now, TZ, 'dd.MM.yyyy');
    var o = { no: no, name: v[HEAD.indexOf('Имя')], date: Utilities.formatDate(new Date(String(v[HEAD.indexOf('Подписан на устройстве')])), TZ, 'dd.MM.yyyy'), today: today,
      prog: v[HEAD.indexOf('Программа')], total: v[HEAD.indexOf('Итого CHF')], eu: eu ? L.eu : '' };
    send(v[HEAD.indexOf('E-mail')], fill(L.s2, o), fill(L.b2, o));
    return 'Готово: договор ' + no + ' подтверждён ' + fmtNow(now) + ', письмо отправлено на ' + v[HEAD.indexOf('E-mail')] + '.';
  } finally { lock.releaseLock(); }
}
