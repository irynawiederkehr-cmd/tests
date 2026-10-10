/* voznesenskaya.ch как приложение на телефоне и планшете (09.10.2026), так же, как svoiludi.ch, но в коричневом цвете сайта.
   1) Сервис-воркер /sw.js: страницы, которые уже открывались, работают без интернета.
   2) Открыто с иконки на экране «Домой» — внизу вкладки: Главная · Твой путь · Тесты · Знакомство · Ещё.
   3) Открыто в браузере телефона или планшета — подсказка «Установить как приложение».
   Язык: <html lang> (ru, uk, de, en). Проверка: ?app=1, ?install=ios|android|inapp.
   4) При первом заходе — вопрос «Якою мовою тобі комфортно? · На каком языке тебе комфортно?» и кнопки
      «Українською · По-русски · Deutsch · English» (10.10.2026, просьба Ирины, так же, как на svoiludi.ch). Выбор запоминается
      (irinaTestsLang — общий ключ сайта и тестов), больше не спрашиваем. Подсказка об установке ждёт выбора. Проверка: ?lang=ask.
   Личные данные не собираются; в localStorage только отметка «Не сейчас» (vz-app-later) и выбранный язык (irinaTestsLang). */
(function () {
  if (window.__vzApp) return; window.__vzApp = true;
  var Q = location.search;
  function lang() { var l = (document.documentElement.lang || 'ru').slice(0, 2); return /^(ru|uk|de|en)$/.test(l) ? l : 'ru'; }
  var D = {
    ru: { tabs: ['Главная', 'Твой путь', 'Тесты', 'Знакомство', 'Ещё'], who: 'Обо мне', prod: 'Продукты', svoi: 'Свои люди', privacy: 'Политика конфиденциальности',
      share: 'Поделиться приложением с друзьями', reload: 'Обновить страницу', langs: 'Язык', close: 'Закрыть',
      shareText: 'Ирина Вознесенская — коуч для тех, кто переехал. Тесты, «Твой путь в новой стране» и работа с ней. Можно установить как приложение на телефон.',
      title: 'Сайт Ирины — как приложение на телефоне', lead: 'Иконка на экране «Домой», сайт открывается во весь экран, с вкладками внизу. Без App Store и без регистрации.',
      help: 'Это тот же сайт, только открывается с иконки, как приложение. Ничего не скачивается из App Store или Google Play, места на телефоне почти не занимает. Удалить можно как обычную иконку.',
      install: 'Установить приложение', later: 'Не сейчас', foot: '📱 Установить как приложение', btn: 'Установить приложение на телефон',
      ios: ['Нажми «Поделиться» <span class="pa-ico">⬆︎</span> внизу экрана (на iPad — вверху справа).', 'Прокрути вниз и выбери «На экран „Домой“».', 'Нажми «Добавить». Иконка появится на экране.'],
      android: ['Открой меню браузера ⋮ вверху справа.', 'Выбери «Установить приложение» или «Добавить на главный экран».', 'Подтверди. Иконка появится на экране.'],
      inapp: '<b>Сейчас страница открыта внутри Instagram, Telegram или другого приложения.</b> Отсюда установить нельзя. Нажми ⋯ или значок вверху и выбери «Открыть в браузере» (Safari или Chrome), а там — «Установить приложение».',
      note: '<b>Важно для тестов.</b> Начатые в браузере ответы в приложение сами не переходят. Если тест уже начат, сначала закончи его здесь.' },
    uk: { tabs: ['Головна', 'Твій шлях', 'Тести', 'Знайомство', 'Ще'], who: 'Про мене', prod: 'Продукти', svoi: 'Свої люди', privacy: 'Політика конфіденційності',
      share: 'Поділитися застосунком з друзями', reload: 'Оновити сторінку', langs: 'Мова', close: 'Закрити',
      shareText: 'Ірина Вознесенська — коуч для тих, хто переїхав. Тести, «Твій шлях у новій країні» та робота з нею. Можна встановити як застосунок на телефон.',
      title: 'Сайт Ірини — як застосунок на телефоні', lead: 'Іконка на екрані «Додому», сайт відкривається на весь екран, з вкладками внизу. Без App Store і без реєстрації.',
      help: 'Це той самий сайт, тільки відкривається з іконки, як застосунок. Нічого не завантажується з App Store чи Google Play, місця на телефоні майже не займає. Видалити можна як звичайну іконку.',
      install: 'Встановити застосунок', later: 'Не зараз', foot: '📱 Встановити як застосунок', btn: 'Встановити застосунок на телефон',
      ios: ['Натисни «Поділитися» <span class="pa-ico">⬆︎</span> внизу екрана (на iPad — угорі праворуч).', 'Прокрути вниз і вибери «На екран „Додому“».', 'Натисни «Додати». Іконка з’явиться на екрані.'],
      android: ['Відкрий меню браузера ⋮ угорі праворуч.', 'Вибери «Встановити застосунок» або «Додати на головний екран».', 'Підтверди. Іконка з’явиться на екрані.'],
      inapp: '<b>Зараз сторінка відкрита всередині Instagram, Telegram чи іншого застосунку.</b> Звідси встановити не можна. Натисни ⋯ або значок угорі й вибери «Відкрити в браузері» (Safari чи Chrome), а там — «Встановити застосунок».',
      note: '<b>Важливо для тестів.</b> Розпочаті в браузері відповіді в застосунок самі не переходять. Якщо тест уже розпочато, спершу закінчи його тут.' },
    de: { tabs: ['Start', 'Dein Weg', 'Tests', 'Kennenlernen', 'Mehr'], who: 'Über mich', prod: 'Angebote', svoi: 'Svoi ludi', privacy: 'Datenschutzerklärung',
      share: 'App mit Freunden teilen', reload: 'Seite neu laden', langs: 'Sprache', close: 'Schliessen',
      shareText: 'Iryna Voznesenskaya — Coach für alle, die umgezogen sind. Tests, «Dein Weg im neuen Land» und Arbeit mit ihr. Lässt sich als App aufs Handy installieren.',
      title: 'Irynas Website — als App auf dem Handy', lead: 'Ein Symbol auf dem Home-Bildschirm, die Seite öffnet im Vollbild, mit Tabs unten. Ohne App Store und ohne Anmeldung.',
      help: 'Es ist dieselbe Website, sie öffnet sich nur über das Symbol wie eine App. Nichts wird aus dem App Store oder Google Play geladen, sie braucht kaum Speicher. Entfernen wie jedes andere Symbol.',
      install: 'App installieren', later: 'Nicht jetzt', foot: '📱 Als App installieren', btn: 'App aufs Handy installieren',
      ios: ['Tippe auf «Teilen» <span class="pa-ico">⬆︎</span> unten (auf dem iPad oben rechts).', 'Scrolle nach unten und wähle «Zum Home-Bildschirm».', 'Tippe auf «Hinzufügen». Das Symbol erscheint auf dem Bildschirm.'],
      android: ['Öffne das Browsermenü ⋮ oben rechts.', 'Wähle «App installieren» oder «Zum Startbildschirm hinzufügen».', 'Bestätige. Das Symbol erscheint auf dem Bildschirm.'],
      inapp: '<b>Die Seite ist gerade in Instagram, Telegram oder einer anderen App geöffnet.</b> Von hier aus lässt sie sich nicht installieren. Tippe auf ⋯ oder das Symbol oben und wähle «Im Browser öffnen» (Safari oder Chrome), dort dann «App installieren».',
      note: '<b>Wichtig für die Tests.</b> Im Browser begonnene Antworten werden nicht automatisch in die App übernommen. Wenn du schon einen Test begonnen hast, schliesse ihn zuerst hier ab.' },
    en: { tabs: ['Home', 'Your path', 'Tests', 'Meet me', 'More'], who: 'About me', prod: 'Services', svoi: 'Svoi ludi', privacy: 'Privacy policy',
      share: 'Share the app with friends', reload: 'Reload page', langs: 'Language', close: 'Close',
      shareText: 'Iryna Voznesenskaya — a coach for people who have moved abroad. Tests, “Your path in a new country” and working with her. You can install it as an app on your phone.',
      title: 'Iryna’s website — as an app on your phone', lead: 'An icon on your home screen, the site opens full screen with tabs at the bottom. No App Store, no sign-up.',
      help: 'It is the same website, it just opens from an icon like an app. Nothing is downloaded from the App Store or Google Play and it takes almost no space. Remove it like any other icon.',
      install: 'Install the app', later: 'Not now', foot: '📱 Install as an app', btn: 'Install the app on your phone',
      ios: ['Tap “Share” <span class="pa-ico">⬆︎</span> at the bottom of the screen (on iPad, top right).', 'Scroll down and choose “Add to Home Screen”.', 'Tap “Add”. The icon appears on your screen.'],
      android: ['Open the browser menu ⋮ at the top right.', 'Choose “Install app” or “Add to Home screen”.', 'Confirm. The icon appears on your screen.'],
      inapp: '<b>This page is open inside Instagram, Telegram or another app.</b> It cannot be installed from here. Tap ⋯ or the icon at the top, choose “Open in browser” (Safari or Chrome) and then “Install app”.',
      note: '<b>Important for the tests.</b> Answers started in the browser do not move to the app automatically. If you have already started a test, finish it here first.' }
  };

  var ua = navigator.userAgent;
  var IOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var INAPP = /Instagram|FBAN|FBAV|FB_IAB|Line\/|Telegram|WhatsApp|; wv\)/i.test(ua);
  var force = (Q.match(/[?&]install=(ios|android|inapp)/) || [])[1];
  var STANDALONE = /[?&]app=1/.test(Q) || navigator.standalone === true ||
    (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: minimal-ui)').matches));
  var TOUCH = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var TEST = /^\/(testy|kompas|roza-lyubvi|stupeni|blizost)\//.test(location.pathname);

  if ('serviceWorker' in navigator && /(^|\.)voznesenskaya\.ch$|^localhost$|^127\.0\.0\.1$/.test(location.hostname)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }

  var css = document.createElement('style');
  css.textContent = [
    '.pa-tabs{position:fixed;left:0;right:0;bottom:0;z-index:900;display:none;background:color-mix(in srgb,var(--paper,#FFFCF8) 94%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-top:1px solid var(--line,#E5D9C9);padding:6px 6px calc(6px + env(safe-area-inset-bottom))}',
    '.pa-tabs ul{list-style:none;margin:0 auto;padding:0;display:grid;grid-template-columns:repeat(5,1fr);max-width:640px}',
    '.pa-tabs a,.pa-tabs button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px 4px;border:0;background:none;font:600 .7rem/1.15 Manrope,system-ui,sans-serif;color:var(--muted,#7A6E62);text-decoration:none;cursor:pointer;width:100%;border-radius:12px;-webkit-tap-highlight-color:transparent}',
    '.pa-tabs svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
    '.pa-tabs [aria-current="page"]{color:var(--brown,#6E4F3C)}',
    '.pa-tabs [aria-current="page"]::before{content:"";display:block;width:26px;height:3px;border-radius:3px;background:var(--brown,#6E4F3C);margin:-6px 0 3px}',
    '.pa-tabs a:active,.pa-tabs button:active{background:color-mix(in srgb,var(--brown,#6E4F3C) 10%,transparent)}',
    'html.pa-app .pa-tabs{display:block}html.pa-app body{padding-bottom:calc(72px + env(safe-area-inset-bottom))}',
    'html.pa-app #langbar.langbar{bottom:calc(80px + env(safe-area-inset-bottom))!important}',
    '@media (min-width:1101px){html.pa-app .pa-tabs{display:none}html.pa-app body{padding-bottom:0}html.pa-app #langbar.langbar{bottom:14px!important}}',
    '.pa-sheet,.pa-card{font-family:Manrope,system-ui,sans-serif;color:var(--ink,#2F2924)}',
    '.pa-back{position:fixed;inset:0;z-index:950;background:rgba(30,24,20,.38);display:flex;align-items:flex-end;justify-content:center}',
    '.pa-sheet{background:var(--paper,#FFFCF8);width:100%;max-width:560px;border-radius:22px 22px 0 0;padding:10px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.18);max-height:88vh;overflow:auto}',
    '.pa-grip{width:42px;height:5px;border-radius:5px;background:var(--line,#E5D9C9);margin:0 auto 12px}',
    '.pa-sheet h2{font:400 1.5rem/1.2 Forum,Georgia,serif;margin:0 0 8px}',
    '.pa-sheet a,.pa-sheet .pa-row{display:flex;align-items:center;gap:12px;width:100%;padding:14px 4px;border:0;border-bottom:1px solid var(--line,#E5D9C9);background:none;font:600 1rem Manrope,system-ui,sans-serif;color:var(--ink,#2F2924);text-decoration:none;text-align:left;cursor:pointer}',
    '.pa-sheet svg{width:22px;height:22px;fill:none;stroke:var(--brown,#6E4F3C);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}',
    '.pa-langs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px 0 4px}',
    '.pa-langs a{justify-content:center;border:1.5px solid var(--line,#E5D9C9)!important;border-radius:12px;padding:10px 0}',
    '.pa-langs a[aria-current="true"]{background:var(--brown,#6E4F3C);color:var(--paper,#FFFCF8);border-color:var(--brown,#6E4F3C)!important}',
    '.pa-x{display:block;margin:12px auto 0;border:1.5px solid var(--brown,#6E4F3C);color:var(--brown,#6E4F3C);background:none;border-radius:12px;padding:10px 22px;font:700 .95rem Manrope,system-ui,sans-serif;cursor:pointer}',
    '.pa-card{position:fixed;z-index:940;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:520px;margin:0 auto;background:var(--paper,#FFFCF8);border:1px solid var(--line,#E5D9C9);border-radius:20px;box-shadow:0 14px 44px rgba(40,30,20,.22);padding:16px 16px 14px;animation:paUp .35s ease-out}',
    '@keyframes paUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}',
    '.pa-head{display:flex;gap:12px;align-items:flex-start}',
    '.pa-head img{width:52px;height:52px;border-radius:14px;flex:none}',
    '.pa-head h3{font:400 1.22rem/1.2 Forum,Georgia,serif;margin:2px 0 4px}',
    '.pa-head p{margin:0;font-size:.88rem;line-height:1.45;color:var(--muted,#7A6E62)}',
    '.pa-q{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;border:1.5px solid var(--brown,#6E4F3C);color:var(--brown,#6E4F3C);font:700 .72rem Manrope,system-ui,sans-serif;background:none;cursor:pointer;vertical-align:2px;margin-left:4px;padding:0}',
    '.pa-help{display:none;margin:10px 0 0;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--brown,#6E4F3C) 9%,var(--paper,#FFFCF8));font-size:.85rem;line-height:1.45}',
    '.pa-help.on{display:block}',
    '.pa-steps{margin:12px 0 0;padding:0;list-style:none;counter-reset:s}',
    '.pa-steps li{counter-increment:s;position:relative;padding:6px 0 6px 34px;font-size:.92rem;line-height:1.4}',
    '.pa-steps li::before{content:counter(s);position:absolute;left:0;top:5px;width:24px;height:24px;border-radius:50%;background:var(--brown,#6E4F3C);color:var(--paper,#FFFCF8);display:grid;place-items:center;font-weight:700;font-size:.8rem}',
    '.pa-ico{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:6px;border:1.5px solid currentColor;font-size:.8rem;vertical-align:-4px;color:#2E6FD8}',
    '.pa-note,.pa-warn{margin:10px 0 0;padding:10px 12px;border-radius:12px;font-size:.84rem;line-height:1.45}',
    '.pa-note{background:var(--mustard-soft,#F3E3C2)}',
    '.pa-warn{background:color-mix(in srgb,var(--brown,#6E4F3C) 9%,var(--paper,#FFFCF8))}',
    '.pa-btns{display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap}',
    '.pa-go{border:0;border-radius:12px;padding:11px 20px;background:var(--brown,#6E4F3C);color:var(--paper,#FFFCF8);font:700 .95rem Manrope,system-ui,sans-serif;cursor:pointer}',
    '.pa-later{border:0;background:none;color:var(--muted,#7A6E62);font:600 .9rem Manrope,system-ui,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:10px 6px}',
    '.pa-foot{display:inline-block;margin:10px 0;border:1.5px solid var(--brown,#6E4F3C);color:var(--brown,#6E4F3C);background:none;border-radius:12px;padding:9px 16px;font:700 .9rem Manrope,system-ui,sans-serif;cursor:pointer}',
    /* кнопка «Установить приложение» под верхним меню — как на svoiludi.ch, в коричневом цвете (10.10.2026) */
    '.pa-ibtn{order:4;flex:1 0 100%;display:flex;align-items:center;justify-content:center;gap:9px;min-height:46px;margin:0 0 12px;padding:8px 14px;border-radius:12px;border:1.5px solid var(--brown,#6E4F3C);background:color-mix(in srgb,var(--brown,#6E4F3C) 9%,var(--paper,#FFFCF8));color:var(--ink,#2F2924);font:700 .9rem/1.2 Manrope,system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;box-sizing:border-box}',
    '.pa-ibtn svg{width:22px;height:22px;flex:none;fill:none;stroke:var(--brown,#6E4F3C);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
    '.pa-ibtn:active{transform:scale(.98)}',
    '@media (min-width:1101px){.pa-ibtn{order:1;flex:0 0 auto;min-height:0;margin:0;padding:7px 12px;font-size:.84rem}.pa-ibtn svg{width:18px;height:18px}}',
    '@media (min-width:1360px){.pa-ibtn{padding:7px 9px}.pa-ibtn span{display:none}}',
    'html.pa-app .pa-ibtn{display:none!important}',
    /* вопрос о языке при первом заходе (10.10.2026): только вопрос и кнопки, как кнопка установки — светло-коричневые с рамкой */
    '.pa-lang{padding:18px 16px 16px}',
    '.pa-lang h3{font:400 1.3rem/1.3 Forum,Georgia,serif;margin:0;text-align:center}',
    '.pa-lang h3 span{display:block}',
    '.pa-lbtns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}',
    '.pa-lbtns button{min-height:48px;padding:10px 12px;border-radius:12px;border:1.5px solid var(--brown,#6E4F3C);background:color-mix(in srgb,var(--brown,#6E4F3C) 9%,var(--paper,#FFFCF8));color:var(--ink,#2F2924);font:700 1rem/1.2 Manrope,system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}',
    '.pa-lbtns button:active{transform:scale(.98)}',
    '@media (max-width:1100px){html.pa-app .pa-lang{bottom:calc(84px + env(safe-area-inset-bottom))}}',
    '@media print{.pa-tabs,.pa-card,.pa-back,.pa-foot,.pa-ibtn{display:none!important}}'
  ].join('\n');
  document.head.appendChild(css);

  var I = {
    home: '<svg viewBox="0 0 24 24"><path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/></svg>',
    put: '<svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18h6a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h6"/></svg>',
    tests: '<svg viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="m8.5 9 1.5 1.5L13 7.5M8.5 15l1.5 1.5 3-3M15 9.5h1M15 15.5h1"/></svg>',
    meet: '<svg viewBox="0 0 24 24"><path d="M20.5 4.5 3.5 11l6 2.2L18 7l-6.5 7.3 6 5.2z"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/></svg>',
    who: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.7-3.8 3.4-6 7-6s6.3 2.2 7 6"/></svg>',
    prod: '<svg viewBox="0 0 24 24"><path d="M12 3.5 20.5 8 12 12.5 3.5 8z"/><path d="M3.5 12 12 16.5 20.5 12M3.5 16 12 20.5 20.5 16"/></svg>',
    svoi: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.4"/><circle cx="12" cy="4.5" r="1.8"/><circle cx="12" cy="19.5" r="1.8"/><circle cx="5.5" cy="8.3" r="1.8"/><circle cx="18.5" cy="8.3" r="1.8"/><circle cx="5.5" cy="15.7" r="1.8"/><circle cx="18.5" cy="15.7" r="1.8"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 15V4M8 7.5 12 3.5l4 4"/><path d="M6 11H5.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"/></svg>',
    reload: '<svg viewBox="0 0 24 24"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4"/></svg>'
  };
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  function pre(l) { return l === 'ru' ? '' : '/' + l; }

  function tabBar() {
    var l = lang(), T = D[l], P = pre(l);
    document.documentElement.classList.add('pa-app');
    var path = location.pathname.replace(/^\/(uk|de|en)(?=\/)/, '');
    var cur = path === '/' || path === '/index.html' ? 0 : /^\/put\//.test(path) ? 1 : TEST ? 2 : 4;
    var items = [[P + '/', I.home], [P + '/put/', I.put], ['/testy/#lang=' + l, I.tests], ['https://t.me/IrynaNeuroCoach', I.meet]];
    var h = '<div class="pa-tabs" role="navigation" aria-label="' + T.tabs.slice(0, 4).join(' · ') + '"><ul>';
    items.forEach(function (it, i) {
      h += '<li><a href="' + it[0] + '"' + (cur === i ? ' aria-current="page"' : '') + (i === 3 ? ' target="_blank" rel="noopener"' : '') + '>' + it[1] + '<span>' + T.tabs[i] + '</span></a></li>';
    });
    h += '<li><button type="button" class="pa-more"' + (cur === 4 ? ' aria-current="page"' : '') + '>' + I.more + '<span>' + T.tabs[4] + '</span></button></li></ul></div>';
    var bar = el(h); document.body.appendChild(bar);
    bar.querySelector('.pa-more').addEventListener('click', moreSheet);
  }
  function moreSheet() {
    var l = lang(), T = D[l], P = pre(l);
    var path = location.pathname.replace(/^\/(uk|de|en)(?=\/)/, '');
    var langs = ['ru', 'uk', 'de', 'en'].map(function (x) {
      var href = TEST || /^\/(privacy|impressum)\//.test(path) ? path + '#lang=' + x : pre(x) + path;
      return '<a href="' + href + '" data-lang="' + x + '"' + (x === l ? ' aria-current="true"' : '') + '>' + (x === 'uk' ? 'UA' : x.toUpperCase()) + '</a>';
    }).join('');
    var h = '<div class="pa-back" role="dialog" aria-modal="true" aria-label="' + T.tabs[4] + '"><div class="pa-sheet"><div class="pa-grip"></div><h2>' + T.tabs[4] + '</h2>' +
      '<a href="' + P + '/#who">' + I.who + T.who + '</a>' +
      '<a href="' + P + '/#path">' + I.prod + T.prod + '</a>' +
      '<a href="https://svoiludi.ch/' + (l === 'uk' ? 'uk/' : '') + '">' + I.svoi + T.svoi + '</a>' +
      '<a href="/privacy/#lang=' + l + '">' + I.lock + T.privacy + '</a>' +
      '<button type="button" class="pa-row" data-a="share">' + I.share + T.share + '</button>' +
      '<button type="button" class="pa-row" data-a="reload">' + I.reload + T.reload + '</button>' +
      '<div class="pa-langs" aria-label="' + T.langs + '">' + langs + '</div>' +
      '<button type="button" class="pa-x">' + T.close + '</button></div></div>';
    var b = el(h); document.body.appendChild(b);
    function close() { b.remove(); }
    b.addEventListener('click', function (e) {
      if (e.target === b || e.target.closest('.pa-x')) return close();
      var lk = e.target.closest('[data-lang]');
      if (lk) { try { localStorage.setItem('irinaTestsLang', lk.dataset.lang); } catch (x) {} if (TEST) { e.preventDefault(); location.href = lk.getAttribute('href'); location.reload(); } return; }
      var a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'reload') { location.reload(); }
      if (a.dataset.a === 'share') {
        var url = 'https://voznesenskaya.ch' + P + '/';
        if (navigator.share) navigator.share({ title: T.title, text: T.shareText, url: url }).catch(function () {});
        else try { navigator.clipboard.writeText(T.shareText + ' ' + url); } catch (x) {}
        close();
      }
    });
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (document.readyState === 'complete') installBtn(); });
  window.addEventListener('appinstalled', function () { var c = document.querySelector('.pa-card'); if (c) c.remove(); var ib = document.querySelector('.pa-ibtn'); if (ib) ib.remove(); });
  function later(set) {
    try {
      if (set) localStorage.setItem('vz-app-later', String(Date.now()));
      return Date.now() - (+localStorage.getItem('vz-app-later') || 0) < 30 * 864e5;
    } catch (e) { return false; }
  }
  function card(kind) {
    var T = D[lang()];
    var old = document.querySelector('.pa-card'); if (old) old.remove();
    kind = kind || (INAPP ? 'inapp' : IOS ? 'ios' : 'android');
    var body = kind === 'inapp' ? '<div class="pa-warn">' + T.inapp + '</div>'
      : (kind === 'ios' || !deferred) ? '<ol class="pa-steps"><li>' + T[kind === 'ios' ? 'ios' : 'android'].join('</li><li>') + '</li></ol>' : '';
    var h = '<aside class="pa-card" role="dialog" aria-label="' + T.title + '"><div class="pa-head"><img src="/icon-192.png" alt=""><div>' +
      '<h3>' + T.title + '<button type="button" class="pa-q" aria-label="?" aria-expanded="false">?</button></h3><p>' + T.lead + '</p></div></div>' +
      '<div class="pa-help">' + T.help + '</div>' + body + (kind !== 'inapp' && (TEST || force) ? '<div class="pa-note">' + T.note + '</div>' : '') +
      '<div class="pa-btns">' + (kind === 'android' && deferred ? '<button type="button" class="pa-go">' + T.install + '</button>' : '') +
      '<button type="button" class="pa-later">' + T.later + '</button></div></aside>';
    var c = el(h); document.body.appendChild(c);
    c.querySelector('.pa-q').addEventListener('click', function () { var hp = c.querySelector('.pa-help'); hp.classList.toggle('on'); this.setAttribute('aria-expanded', hp.classList.contains('on')); });
    c.querySelector('.pa-later').addEventListener('click', function () { later(true); c.remove(); });
    var go = c.querySelector('.pa-go');
    if (go) go.addEventListener('click', function () { deferred.prompt(); deferred.userChoice.then(function () { deferred = null; c.remove(); }); });
  }
  function footerLink() {
    var f = document.querySelector('footer'); if (!f) return;
    var b = el('<button type="button" class="pa-foot">' + D[lang()].foot + '</button>');
    b.addEventListener('click', function () { card(force); });
    var box = document.createElement('div'); box.appendChild(b); f.insertBefore(box, f.firstChild);
  }
  /* кнопка «Установить приложение на телефон» под верхним меню (10.10.2026, как на svoiludi.ch): Android и компьютер с Chrome — окно установки,
     iPhone и iPad — подсказка с шагами, Instagram и Telegram — «открой в браузере». В приложении кнопки нет. */
  function installBtn() {
    if (STANDALONE || document.querySelector('.pa-ibtn')) return;
    var page = document.querySelector('header.top .page'); if (!page) return;
    var t = D[lang()].btn;
    var b = el('<button type="button" class="pa-ibtn" title="' + t + '" aria-label="' + t + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M12 7.5v7M9.2 11.8 12 14.6l2.8-2.8M10.5 18.5h3"/></svg><span>' + t + '</span></button>');
    b.addEventListener('click', function () {
      if (deferred && !INAPP) { deferred.prompt(); deferred.userChoice.then(function (r) { deferred = null; if (r && r.outcome === 'accepted') b.remove(); }); return; }
      card(force);
    });
    page.appendChild(b);
  }
  function manifest() {   /* манифест на языке страницы */
    var l = lang(), m = document.querySelector('link[rel="manifest"]');
    if (m && l !== 'ru') m.href = '/site.' + l + '.webmanifest';
    var t = document.querySelector('meta[name="apple-mobile-web-app-title"]');   /* подпись под иконкой на iPhone */
    if (t) t.content = { ru: 'Ирина', uk: 'Ірина', de: 'Iryna', en: 'Iryna' }[l];
  }

  /* вопрос о языке при первом заходе (10.10.2026). Спрашиваем один раз: выбор хранится в irinaTestsLang.
     Не спрашиваем: если язык уже выбран (кнопками языка, во вкладке «Ещё», ссылкой с #lang= или здесь), у роботов и снимков сайта,
     на страницах без других языков (нет переключателя). ?lang=ask — показать для проверки. */
  var LKEY = 'irinaTestsLang';
  function langAsk(after) {
    var ask = /[?&]lang=ask/.test(Q);
    if (!document.querySelector('#langbar, .langbar') && !ask) return false;
    if (!ask) {
      if (navigator.webdriver) return false;
      try { if (localStorage.getItem(LKEY)) return false; } catch (e) { return false; }
    }
    var cur = lang();
    var c = el('<aside class="pa-card pa-lang" role="dialog" aria-label="Мова · Язык · Sprache · Language">' +
      '<h3><span lang="uk">Якою мовою тобі комфортно?</span><span lang="ru">На каком языке тебе комфортно?</span></h3>' +
      '<div class="pa-lbtns"><button type="button" data-l="uk" lang="uk">Українською</button><button type="button" data-l="ru" lang="ru">По-русски</button>' +
      '<button type="button" data-l="de" lang="de">Deutsch</button><button type="button" data-l="en" lang="en">English</button></div></aside>');
    function done() { c.remove(); document.removeEventListener('keydown', esc); if (after) after(); }
    function esc(e) { if (e.key === 'Escape') { try { localStorage.setItem(LKEY, cur); } catch (x) {} done(); } }
    c.addEventListener('click', function (e) {
      var bt = e.target.closest('[data-l]'); if (!bt) return;
      var l = bt.dataset.l;
      try { localStorage.setItem(LKEY, l); } catch (x) {}
      if (l === cur) return done();
      var path = location.pathname.replace(/^\/(uk|de|en)(?=\/)/, '');
      var q = Q.replace(/[?&]lang=ask/, '').replace(/^&/, '?');
      if (TEST || /^\/(privacy|impressum)\//.test(path)) {   /* язык этих страниц — по #lang=; если меняется только #, страницу надо перезагрузить */
        if (path + q === location.pathname + location.search) { location.hash = 'lang=' + l; location.reload(); } else location.href = path + q + '#lang=' + l;
        return;
      }
      var a = document.querySelector('#langbar a[data-lang="' + l + '"]');
      location.href = (a ? a.getAttribute('href') : pre(l) + path).split('#')[0] + q + location.hash;
    });
    document.addEventListener('keydown', esc);
    setTimeout(function () { document.body.appendChild(c); }, 400);
    return true;
  }

  function start() {
    manifest();
    if (STANDALONE) { tabBar(); langAsk(); return; }
    if (deferred) installBtn();
    if (!(TOUCH || force)) { langAsk(); return; }
    installBtn();
    footerLink();
    if (force) { setTimeout(function () { card(force); }, 300); return; }
    if (langAsk(hintLater)) return;   // сначала язык, подсказка об установке — после выбора
    hintLater();
  }
  function hintLater() {
    if (later()) return;
    var shown = false;
    function show() { if (shown) return; shown = true; window.removeEventListener('scroll', onScroll); card(); }
    function onScroll() { if (scrollY > innerHeight * 1.5) show(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(show, 8000);
  }
  if (document.readyState !== 'loading') manifest(); else document.addEventListener('DOMContentLoaded', manifest);
  /* тесты ставят язык страницы скриптом — ждём загрузки */
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
