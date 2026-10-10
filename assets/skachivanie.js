/* Галочка перед скачиванием и номер документа (решение Ирины 10.10.2026, документ проекта «skachivanie-i-nomer.md»).
   Зачем: защитить Ирину и Alonira.ch AG от упрёков и претензий. Человек перед скачиванием сам подтверждает, что это образец,
   в нём могут быть ошибки, его нужно перепроверить, а решение и ответственность за его использование остаются за ним;
   по номеру файла в реестре можно показать, что такое подтверждение было.
   Один и тот же файл на svoiludi.ch (assets/skachivanie.js) и на voznesenskaya.ch (assets/skachivanie.js), русский, украинский,
   немецкий и английский — по языку страницы, поэтому отдельной украинской сборки у файла нет.
   Что делает:
   - над первой кнопкой скачивания ставит галочку «Я понимаю: это образец… Я перепроверю…». Пока её нет, кнопки PDF, PNG,
     «Отправить», файл календаря и «В Google Календарь» серые и не скачивают. Галочка действует, пока страница открыта;
   - на каждое скачивание выдаёт номер SL-ГГГГММДД-XXXXXX (на voznesenskaya.ch VZ-…). Движки PDF и PNG печатают его внизу
     строкой SVLDOC.label(язык документа): shema.js, wmpdf.js, bwprint.js, тесты voznesenskaya.ch;
   - после каждого скачивания показывает напоминание «перепроверь»;
   - отправляет в «Реестр документов» (Google Таблица, скрипт _i18n/reestr/reestr-dokumentov.gs) только номер, дату, сайт,
     страницу, инструмент, язык, формат и версию текста галочки. Без имени, IP и того, что человек вписал. Без интернета запись
     ждёт в браузере и уходит сама, когда интернет появится.
   Страница может задать: window.SVLDOC_SEL — ещё кнопки (CSS-селектор); window.SVLDOC_SELF = true — номер выдаёт сам движок
   (тесты: разбор и бланк — два файла на одно нажатие); window.SVL_VIP — подписка без знаков (номер на листе не печатается). */
(function(){
  if (window.SVLDOC) return;
  /* адрес веб-приложения Google Apps Script «Реестр документов» (развёрнут 10.10.2026 в аккаунте iryna.wiederkehr@gmail.com,
     проект «Реестр документов — скрипт (svoiludi.ch и voznesenskaya.ch)»). Если пусто — записи копятся в браузере и уйдут, когда адрес появится. */
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzmMcqH9FfHLSUSv7pb0OIBrYJ-P3hgLX9--BUXMS1XWfZItCty4nqTBhnGCbws6z4EvA/exec';
  var VZ = /voznesenskaya/.test(location.hostname) || window.SVLDOC_SITE === 'vz' || (!/svoiludi/.test(location.hostname) && !!window.__runBundle);
  var SITE = VZ ? 'voznesenskaya.ch' : 'svoiludi.ch', PRE = VZ ? 'VZ' : 'SL', VER = VZ ? 'T1' : 'G1';
  var SEL = '#pdf,#pdf2,#png,#share,#ics,#dlPdf,#dlPng,#dlCli,#dlMine,#dlYear,#dlXlsx,#calIcs,[data-png],[data-dl],a[href*="calendar.google.com/calendar"],#pdfBtn,#wsBtn'
    + (window.SVLDOC_SEL ? ',' + window.SVLDOC_SEL : '');
  var ABC = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  function pl(){ var l = String(window.LANG || document.documentElement.lang || 'ru').slice(0, 2).toLowerCase(); return /^(ru|uk|de|en)$/.test(l) ? l : 'ru'; }

  /* тексты: G — svoiludi.ch (инструменты, схемы, карточки), T — тесты voznesenskaya.ch */
  var TX = {
    ru: {G: 'Я понимаю: это образец для личного использования, а не официальный документ и не юридическая, налоговая или финансовая консультация. В нём могут быть ошибки. Я перепроверю все данные и суммы в официальном источнике или у специалиста. Решение и ответственность за то, как я им воспользуюсь, остаются за мной.',
      T: 'Я понимаю: это инструмент для размышления, а не диагноз и не психологическая консультация. Решение и ответственность за то, как я воспользуюсь результатом, остаются за мной.',
      helpG: '<p><b>Зачем галочка.</b> Мы тщательно готовим материалы, но законы, суммы и сроки меняются, в кантонах и общинах бывают свои правила, и в образце может оказаться ошибка. Поэтому файл — подсказка, а не готовое решение: перепроверить его и решить, как им воспользоваться, можешь только ты.</p><p>У каждого файла свой номер, он напечатан внизу листа. По нему видно, когда и в каком инструменте файл сделан и что перед скачиванием ты подтвердила или подтвердил эти условия. Твоих данных мы при этом не получаем: что ты вписала или вписал, остаётся только на твоём устройстве.</p>',
      helpT: '<p><b>Зачем галочка.</b> Тест помогает посмотреть на себя со стороны, но не ставит диагноз и не заменяет встречу со специалистом. Решения о своей жизни ты принимаешь сама. Если тебе сейчас очень тяжело, обратись к врачу, психотерапевту или в экстренную службу.</p><p>У каждого файла свой номер, он напечатан внизу страниц. По нему видно, что перед скачиванием ты подтвердила эти условия. Твоих ответов мы при этом не получаем.</p>',
      more: 'Ограничение ответственности', need: 'Сначала отметь галочку, тогда файл скачается.', help: 'Подсказка: зачем галочка',
      tG: '<b>Перепроверь, прежде чем использовать.</b> Это образец, а не официальный документ, и в нём может быть ошибка. Сверь все данные и суммы с официальным источником или спроси специалиста.',
      tT: '<b>Это инструмент для размышления.</b> Разбор не ставит диагноз и не заменяет встречу со специалистом.',
      close: 'Закрыть', no: '№', cG: 'подтверждено: это образец', cT: 'подтверждено: не диагноз', demo: 'образец'},
    uk: {G: 'Я розумію: це зразок для особистого використання, а не офіційний документ і не юридична, податкова чи фінансова консультація. У ньому можуть бути помилки. Я перевірю всі дані та суми в офіційному джерелі або у фахівця. Рішення й відповідальність за те, як я ним скористаюся, залишаються за мною.',
      T: 'Я розумію: це інструмент для роздумів, а не діагноз і не психологічна консультація. Рішення й відповідальність за те, як я скористаюся результатом, залишаються за мною.',
      helpG: '<p><b>Навіщо галочка.</b> Ми ретельно готуємо матеріали, але закони, суми й строки змінюються, у кантонах і громадах бувають свої правила, і в зразку може бути помилка. Тому файл — підказка, а не готове рішення: перевірити його й вирішити, як ним скористатися, можеш лише ти.</p><p>У кожного файлу свій номер, він надрукований унизу аркуша. За ним видно, коли і в якому інструменті файл зроблено і що перед завантаженням ти підтвердила чи підтвердив ці умови. Твоїх даних ми при цьому не отримуємо: те, що ти вписала чи вписав, залишається лише на твоєму пристрої.</p>',
      helpT: '<p><b>Навіщо галочка.</b> Тест допомагає подивитися на себе збоку, але не ставить діагноз і не замінює зустріч із фахівцем. Рішення про своє життя ти ухвалюєш сама. Якщо тобі зараз дуже важко, звернися до лікаря, психотерапевта або в екстрену службу.</p><p>У кожного файлу свій номер, він надрукований унизу сторінок. За ним видно, що перед завантаженням ти підтвердила ці умови. Твоїх відповідей ми при цьому не отримуємо.</p>',
      more: 'Обмеження відповідальності', need: 'Спершу постав галочку, тоді файл завантажиться.', help: 'Підказка: навіщо галочка',
      tG: '<b>Перевір, перш ніж використовувати.</b> Це зразок, а не офіційний документ, і в ньому може бути помилка. Звір усі дані та суми з офіційним джерелом або запитай фахівця.',
      tT: '<b>Це інструмент для роздумів.</b> Розбір не ставить діагноз і не замінює зустріч із фахівцем.',
      close: 'Закрити', no: '№', cG: 'підтверджено: це зразок', cT: 'підтверджено: не діагноз', demo: 'зразок'},
    de: {G: 'Ich verstehe: Das ist ein Muster für den persönlichen Gebrauch, kein amtliches Dokument und keine Rechts-, Steuer- oder Finanzberatung. Es kann Fehler enthalten. Ich prüfe alle Angaben und Beträge bei einer offiziellen Stelle oder einer Fachperson nach. Die Entscheidung und die Verantwortung dafür, wie ich es verwende, liegen bei mir.',
      T: 'Ich verstehe: Das ist ein Werkzeug zum Nachdenken, keine Diagnose und keine psychologische Beratung. Die Entscheidung und die Verantwortung dafür, wie ich das Ergebnis nutze, liegen bei mir.',
      helpG: '<p><b>Wozu das Häkchen.</b> Gesetze, Beträge und Fristen ändern sich. Die Datei hilft beim Verstehen, Prüfen und Entscheiden bleibt bei dir.</p><p>Jede Datei hat eine eigene Nummer unten auf dem Blatt. Deine Angaben erhalten wir dabei nicht.</p>',
      helpT: '<p><b>Wozu das Häkchen.</b> Der Test hilft dir, dich von aussen zu betrachten, stellt aber keine Diagnose und ersetzt kein Gespräch mit einer Fachperson. Wenn es dir gerade sehr schwer geht, wende dich an eine Ärztin, einen Psychotherapeuten oder den Notruf.</p><p>Jede Datei hat eine eigene Nummer unten auf den Seiten. Deine Antworten erhalten wir dabei nicht.</p>',
      more: 'Haftungsausschluss', need: 'Setze zuerst das Häkchen, dann wird die Datei heruntergeladen.', help: 'Hinweis: wozu das Häkchen',
      tG: '<b>Vor der Verwendung prüfen.</b> Das ist ein Muster, kein amtliches Dokument. Prüfe alle Angaben und Beträge bei einer offiziellen Stelle oder einer Fachperson.',
      tT: '<b>Ein Werkzeug zum Nachdenken.</b> Die Auswertung stellt keine Diagnose und ersetzt kein Gespräch mit einer Fachperson.',
      close: 'Schliessen', no: 'Nr.', cG: 'bestätigt: Muster', cT: 'bestätigt: keine Diagnose', demo: 'Muster'},
    en: {G: 'I understand: this is a sample for personal use, not an official document and not legal, tax or financial advice. It may contain errors. I will check all details and amounts with an official source or a professional. The decision and the responsibility for how I use it are mine.',
      T: 'I understand: this is a tool for reflection, not a diagnosis and not psychological counselling. The decision and the responsibility for how I use the result are mine.',
      helpG: '<p><b>Why the tick box.</b> Laws, amounts and deadlines change. The file helps you understand; checking and deciding stay with you.</p><p>Every file has its own number at the bottom of the page. We do not receive your details.</p>',
      helpT: '<p><b>Why the tick box.</b> The test helps you look at yourself from the outside, but it does not diagnose anything and does not replace a meeting with a professional. If things feel very hard right now, please contact a doctor, a psychotherapist or the emergency services.</p><p>Every file has its own number at the bottom of the pages. We do not receive your answers.</p>',
      more: 'Disclaimer', need: 'Tick the box first, then the file will download.', help: 'Hint: why the tick box',
      tG: '<b>Check before you use it.</b> This is a sample, not an official document. Check all details and amounts with an official source or a professional.',
      tT: '<b>A tool for reflection.</b> The report does not diagnose anything and does not replace a meeting with a professional.',
      close: 'Close', no: 'No.', cG: 'confirmed: sample', cT: 'confirmed: not a diagnosis', demo: 'sample'}
  };
  /* строка на документе на языке документа (документы инструментов бывают и на французском и итальянском) */
  var DOCL = {ru: TX.ru, uk: TX.uk, de: TX.de, en: TX.en,
    fr: {no: 'N°', cG: 'confirmé : modèle', cT: 'confirmé : pas un diagnostic', demo: 'modèle'},
    it: {no: 'N.', cG: 'confermato: modello', cT: 'confermato: non una diagnosi', demo: 'modello'}};
  function T(){ return TX[pl()]; }

  /* хранение очереди: localStorage, а если он недоступен — в памяти */
  var QK = 'svlDocQueue', mem = [];
  function qget(){ try { var v = JSON.parse(localStorage.getItem(QK) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return mem; } }
  function qput(a){ a = a.slice(-500); try { localStorage.setItem(QK, JSON.stringify(a)); } catch (e) { mem = a; } }

  var ok = false, cur = '', curRec = null, sending = false, curAt = 0;
  /* автоматическая сборка картинок веера и проверки сайта (Playwright): галочка стоит сама, номер — «образец», ничего не отправляется */
  var DEMO = !!navigator.webdriver;
  if (DEMO) ok = true;

  function ymd(){ try { return new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()).replace(/-/g, ''); }
    catch (e) { var d = new Date(); return '' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); } }
  function code(){ var r = new Uint8Array(6), s = ''; try { crypto.getRandomValues(r); } catch (e) { for (var i = 0; i < 6; i++) r[i] = Math.floor(Math.random() * 256); }
    for (var j = 0; j < 6; j++) s += ABC[r[j] % ABC.length]; return s; }
  function toolName(){ var h = document.querySelector('h1'); var t = (h && h.textContent || document.title || '').replace(/\s+/g, ' ').trim(); return t.slice(0, 120); }
  function fmtOf(el){
    var s = ((el && (el.id || '')) + ' ' + (el && el.getAttribute && (el.getAttribute('data-dl') || '') || '') + ' ' + (el && el.hasAttribute && el.hasAttribute('data-png') ? 'png' : '')).toLowerCase();
    if (el && el.tagName === 'A' && /calendar\.google\.com/.test(el.href || '')) return 'Google Календарь';
    if (/png/.test(s)) return 'PNG'; if (/ics|cal/.test(s)) return 'ics'; if (/xlsx|excel/.test(s)) return 'Excel'; if (/share/.test(s)) return 'PDF (отправить)';
    return 'PDF';
  }

  /* выдать номер на один файл и записать его в очередь реестра */
  function issue(fmt, what){
    if (DEMO) { cur = 'demo'; curAt = Date.now(); return cur; }
    curAt = Date.now();
    cur = PRE + '-' + ymd() + '-' + code();
    curRec = {no: cur, site: SITE, page: location.pathname.slice(0, 120), tool: String(what || toolName()).slice(0, 120), lang: '', pl: pl(), fmt: String(fmt || 'PDF').slice(0, 30), ver: VER, t: new Date().toISOString()};
    var q = qget(); q.push(curRec); qput(q);
    setTimeout(flush, 4000);
    refreshToast();
    return cur;
  }
  /* строка для низа документа: «№ SL-… · подтверждено: это образец». Движок передаёт язык документа (ru, uk, de, fr, it, en). */
  function label(l){
    /* номер печатается только в файл, который готовится сейчас (минута после нажатия), а не в предпросмотр на странице */
    if (window.SVL_VIP || !cur || Date.now() - curAt > 90000) return '';
    l = String(l || pl()).slice(0, 2).toLowerCase(); var D = DOCL[l] || DOCL.ru;
    if (curRec && !curRec.lang) { curRec.lang = l; var q = qget(); for (var i = q.length - 1; i >= 0; i--) if (q[i].no === curRec.no) { q[i].lang = l; break; } qput(q); }
    if (cur === 'demo') return D.no + ' ' + D.demo;
    return D.no + ' ' + cur + ' · ' + (VZ ? D.cT : D.cG);
  }
  function flush(){
    if (!ENDPOINT || sending || DEMO) return; if (navigator.onLine === false) return;
    var q = qget(); if (!q.length) return;
    var batch = q.slice(0, 50), nos = batch.map(function(r){ return r.no; });
    sending = true;
    fetch(ENDPOINT, {method: 'POST', mode: 'no-cors', keepalive: true, headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify({kind: 'doc', items: batch})})
      .then(function(){ var left = qget().filter(function(r){ return nos.indexOf(r.no) < 0; }); qput(left); sending = false; if (left.length) setTimeout(flush, 1500); })
      .catch(function(){ sending = false; });
  }
  window.addEventListener('online', flush);
  document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'hidden') flush(); });
  setTimeout(flush, 2500);

  /* ---------- вид ---------- */
  var css = document.createElement('style');
  var ACC = VZ ? 'var(--plum,#6E4F3C)' : 'var(--brown,#4F5E3E)', SOFT = VZ ? 'var(--brand-soft,#EADFCF)' : 'var(--sage-soft,#E3E8D6)', LINE = 'var(--line,' + (VZ ? '#E5D9C9' : '#D9DFCB') + ')';
  css.textContent = ''
    + '.svl-dl{display:flex;gap:10px;align-items:flex-start;box-sizing:border-box;width:100%;flex-basis:100%;background:' + SOFT + ';border:1.5px solid ' + LINE + ';border-radius:12px;padding:12px 14px;margin:0 0 12px;font-size:.92rem;line-height:1.5;color:var(--ink,#2F2924);text-align:left;text-transform:none;letter-spacing:0;font-weight:500}'
    + '.svl-dl input{width:22px;height:22px;flex:none;margin:1px 0 0;accent-color:' + ACC + ';cursor:pointer}'
    + '.svl-dl label{cursor:pointer;flex:1;min-width:0}'
    + '.svl-dl.need{border-color:var(--mustard,#B98324);box-shadow:0 0 0 3px rgba(185,131,36,.28)}'
    + '.svl-dl .svl-need{display:block;color:#A0523D;font-weight:700;font-size:.86rem;margin-top:6px}'
    + '.svl-dl .svl-more{display:block;margin-top:4px;font-size:.84rem;color:var(--muted,#7A6E62)}'
    + '.svl-dl .svl-more a{color:' + ACC + '}'
    + '.svl-dl .svl-q{font:inherit;font-size:.74rem;font-weight:800;width:22px;height:22px;border-radius:50%;border:1.5px solid ' + ACC + ';background:var(--paper,#FFFCF8);color:' + ACC + ';cursor:pointer;padding:0;display:inline-grid;place-items:center;flex:none;line-height:1;margin:1px 0 0}'
    + '.svl-dl .svl-q[aria-expanded="true"]{background:' + ACC + ';color:var(--paper,#FFFCF8)}'
    + '.svl-dl .svl-tip{margin-top:8px;padding-top:8px;border-top:1px solid ' + LINE + ';font-size:.88rem}.svl-dl .svl-tip p{margin:0 0 6px}.svl-dl .svl-tip p:last-child{margin:0}'
    + 'html.svl-dl-off :is(' + SEL + '):not(.svl-dl *){opacity:.45;filter:grayscale(1);cursor:not-allowed}'
    + '.svl-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:950;width:min(440px,calc(100vw - 32px));box-sizing:border-box;background:var(--paper,#FFFCF8);color:var(--ink,#2F2924);border:1.5px solid ' + ACC + ';border-radius:16px;padding:12px 40px 12px 16px;font:500 .9rem/1.5 var(--body,var(--sans,Manrope,system-ui,sans-serif));box-shadow:0 14px 34px -14px rgba(47,41,36,.55)}'
    + '.svl-toast small{display:block;margin-top:4px;color:var(--muted,#7A6E62);font-size:.8rem}'
    + '.svl-toast button{position:absolute;top:6px;right:6px;width:30px;height:30px;border:0;border-radius:50%;background:none;color:var(--muted,#7A6E62);cursor:pointer;font-size:.95rem}'
    + '@media print{.svl-dl,.svl-toast{display:none!important}}';
  document.head.appendChild(css);

  var box = null;
  function morelink(){ var uk = pl() === 'uk';
    if (VZ) return '/impressum/#lang=' + pl() + '&otvetstvennost';
    return (uk ? '/uk' : '') + '/o-proekte/#otvetstvennost'; }
  function makeBox(){
    var t = T(), b = document.createElement('div'); b.className = 'svl-dl'; b.setAttribute('role', 'group');
    var id = 'svlDlOk';
    var helpKey = 'svldl';
    var useHelp = !!window.SVL_HELP && !VZ;
    if (useHelp) { window.HELP = window.HELP || {}; window.HELP[helpKey] = (VZ ? t.helpT : t.helpG) + '<p><a href="' + morelink() + '">' + t.more + ' →</a></p>'; }
    b.innerHTML = '<input type="checkbox" id="' + id + '"><div style="flex:1;min-width:0"><label for="' + id + '"></label><span class="svl-need" hidden></span><div class="svl-tip" hidden></div></div>'
      + (useHelp ? '<button type="button" class="qh" data-help="' + helpKey + '" aria-expanded="false" style="margin:1px 0 0"></button>' : '<button type="button" class="svl-q" aria-expanded="false">?</button>');
    b.querySelector('label').textContent = VZ ? t.T : t.G;
    b.querySelector('.svl-need').textContent = t.need;
    var q = b.querySelector('.qh, .svl-q'); q.textContent = '?'; q.setAttribute('aria-label', t.help);
    if (!useHelp) {
      var tip = b.querySelector('.svl-tip'); tip.innerHTML = (VZ ? t.helpT : t.helpG) + '<p><a href="' + morelink() + '">' + t.more + ' →</a></p>';
      q.addEventListener('click', function(){ var o = tip.hidden; tip.hidden = !o; q.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    }
    var cb = b.querySelector('input'); cb.checked = ok;
    cb.addEventListener('change', function(){ ok = cb.checked; paint(); if (ok) { b.classList.remove('need'); b.querySelector('.svl-need').hidden = true; } });
    return b;
  }
  function visible(el){ return !(el.hidden || el.closest('[hidden]')) && el.getClientRects().length > 0; }
  function place(){
    if (box && box.isConnected) return;
    var all = document.querySelectorAll(SEL), first = null;
    for (var i = 0; i < all.length; i++) { if (!all[i].closest('.svl-dl') && visible(all[i])) { first = all[i]; break; } }
    if (!first) return;
    /* над рядом кнопок; если кнопка стоит прямо в карточке рядом с заголовком и текстом — прямо над кнопкой, внутри карточки */
    var anchor = first.closest('.acts,.pdfrow,.dl-row,.dlrow,.btnrow');
    if (!anchor) { var par = first.parentElement, only = par && [].every.call(par.children, function(c){ return /^(BUTTON|A|LABEL|INPUT|SELECT|SPAN|SMALL|I|B|BR)$/.test(c.tagName); }); anchor = only ? par : first; }
    if (!anchor || !anchor.parentElement) return;
    if (!box) box = makeBox();
    anchor.parentElement.insertBefore(box, anchor);
  }
  function paint(){ document.documentElement.classList.toggle('svl-dl-off', !ok); var cb = box && box.querySelector('input'); if (cb) cb.checked = ok; }
  var raf = 0;
  /* requestAnimationFrame не срабатывает во вкладке, которая сейчас не видна, поэтому есть запасной таймер */
  function schedule(){ if (raf) return; var done = false, run = function(){ if (done) return; done = true; raf = 0; place(); }; raf = requestAnimationFrame(run) || 1; setTimeout(run, 300); }
  function start(){ place(); paint(); try { new MutationObserver(function(){ if (!box || !box.isConnected) schedule(); }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class']}); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  function nudge(){
    place(); if (!box) return;
    box.classList.add('need'); var n = box.querySelector('.svl-need'); n.hidden = false;
    try { box.scrollIntoView({block: 'center', behavior: 'smooth'}); } catch (e) { box.scrollIntoView(); }
    var cb = box.querySelector('input'); try { cb.focus({preventScroll: true}); } catch (e) {}
  }

  var toastEl = null, toastTimer = 0;
  function refreshToast(){ if (!toastEl) return; var s = toastEl.querySelector('small'); if (s) s.textContent = cur && cur !== 'demo' ? T().no + ' ' + cur : ''; }
  function toast(){
    if (DEMO) return;
    var t = T();
    if (toastEl) toastEl.remove(); clearTimeout(toastTimer);
    toastEl = document.createElement('div'); toastEl.className = 'svl-toast'; toastEl.setAttribute('role', 'status');
    toastEl.innerHTML = '<div>' + (VZ ? t.tT : t.tG) + '</div><small></small><button type="button">✕</button>';
    toastEl.querySelector('button').setAttribute('aria-label', t.close);
    toastEl.querySelector('button').addEventListener('click', function(){ toastEl.remove(); toastEl = null; });
    var tabs = document.querySelector('.pa-tabs'); if (tabs && getComputedStyle(tabs).display !== 'none') toastEl.style.bottom = (tabs.offsetHeight + 12) + 'px';
    document.body.appendChild(toastEl); refreshToast();
    toastTimer = setTimeout(function(){ if (toastEl) { toastEl.remove(); toastEl = null; } }, 14000);
  }

  /* все нажатия на кнопки скачивания проходят здесь раньше, чем сработает сама кнопка */
  document.addEventListener('click', function(e){
    var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!el || el.closest('.svl-dl')) return;
    if (!ok) { e.preventDefault(); e.stopImmediatePropagation(); nudge(); return; }
    if (!window.SVLDOC_SELF) issue(fmtOf(el));
    toast();
  }, true);

  window.SVLDOC = {
    issue: issue, label: label, flush: flush,
    get ok(){ return ok; }, get cur(){ return cur; },
    accept: function(){ ok = true; paint(); },
    site: SITE, ver: VER
  };
})();
