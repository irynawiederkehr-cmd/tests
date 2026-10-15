/* «Твой путь» — три пути одного метода «Ступени. Твой путь в новой стране» (14.10.2026).
   Просьба Ирины: «в твой путь сделать 3 пути: путь адаптации, путь реализации в своём деле и бизнесе, путь об отношениях
   между мужчиной и женщиной. В каждом из этих путей будут переплетаться одни и те же инструменты, просто адаптироваться под тему».
   Один файл на три страницы: put/ (жизнь в новой стране), delo/ (своё дело), otnosheniya/ (отношения).
   Подключение: <script src="/assets/tri-puti.js" data-path="put|delo|otn" defer></script>
   Рисует: полосу «Три пути» (#triBand), «Одни инструменты на трёх путях» (#triTools), в окне ступени — работа со мной (TRI.coach); открывает ступень по ссылке …/#stupen-N. Модель и цвета в окнах ступеней не называем; о модели, авторах и цветах — отдельная страница «Основа метода» (osnova/, 15.10.2026), ссылка в полосе. */
(function () {
  var me = document.currentScript, here = (me && me.dataset.path) || 'put';
  var P = [
    { k: 'put', h: '../put/', n: 'Жизнь в новой стране', d: 'Восемь ступеней после переезда: от разбитой чаши до жизни, в которой «здесь» и «там» — одна жизнь.', img: '07-zolotye-shvy' },
    { k: 'delo', h: '../delo/', n: 'Своё дело', d: 'От первой мысли «а что, если своё?» до дела, которое живёт без тебя и помогает другим.', img: '05-polnaya-chasha' },
    { k: 'otn', h: '../otnosheniya/', n: 'Отношения', d: 'Мужчина и женщина: от «рядом безопасно» до любви, которая больше вас двоих.', img: '02-svoi-chashi' }
  ];
  var S = {
    put: ['Разбитая чаша', 'Свой круг', 'Я могу сама', 'Понятные правила', 'Своё дело', 'Мой вклад', 'Моя жизнь целиком', 'Здесь и там — одна жизнь'],
    delo: ['С нуля', 'Круг доверия', 'Заявляю о себе', 'Порядок в деле', 'Дело растёт', 'Команда и смысл', 'Система и свобода', 'Дело больше меня'],
    otn: ['Рядом безопасно', 'Наш дом', 'Мой голос в паре', 'Наши договорённости', 'Растём оба', 'Слышим друг друга', 'Вместе по выбору', 'Любовь больше нас']
  };
  /* Работа со мной на трёх путях (15.10.2026, Ирина: «больше показывать, что я как коуч могу дать, с чем со мной можно поработать»;
     «не нужно добавлять всё, что есть»). Только форматы работы со мной и одна строка «для себя между встречами». m — пометка как на главной. */
  var T = [
    { n: '«Знакомство»', w: '30 минут, онлайн', p: '',
      put: ['понять, какая ступень твоей жизни здесь поскрипывает и с чего начать', 'https://t.me/IrynaNeuroCoach', 'бесплатно'],
      delo: ['понять, на какой ступени твоё дело и какой шаг первый', 'https://t.me/IrynaNeuroCoach', 'бесплатно'],
      otn: ['понять, на какой ступени вы сейчас и что можешь сделать ты', 'https://t.me/IrynaNeuroCoach', 'бесплатно'] },
    { n: 'Личная сессия', w: '60 минут, можно несколько подряд', p: 'sess',
      put: ['один вопрос о жизни здесь — и твой следующий шаг', 1, '150 CHF · новое'],
      delo: ['один вопрос о деле — цена, клиенты, страх заявить о себе', 1, '150 CHF · новое'],
      otn: ['один вопрос о тебе в паре — голос, границы, договорённости', 1, '150 CHF · новое'] },
    { n: '«Разговор с картами»', w: '60–75 минут', p: 'kartami',
      put: ['увидеть свою ситуацию через образ чаши, которая собирается заново', 1, '150 CHF · новое'],
      delo: ['увидеть своё дело через образ — от глины к чаше', 1, '150 CHF · новое'],
      otn: ['увидеть вашу пару через образ двух чаш', 1, '150 CHF · новое'] },
    { n: '«Мой фундамент»', w: 'личная работа, 3 часа', p: 'fund',
      put: ['твои ценности рядом с целью жизни — почему хочешь, но не делаешь', 1, '249 CHF'],
      delo: ['твои ценности рядом с целью дела', 1, '249 CHF'],
      otn: ['твои ценности рядом с тем, чего ты хочешь в паре', 1, '249 CHF'] },
    { n: '«Снимок жизни»', w: 'разбор по сферам, 3 часа', p: 'snimok',
      put: ['на какой ступени каждая сфера твоей жизни', 1, '249 CHF · в разработке'],
      delo: ['где твоё дело во всей твоей жизни — семья, силы, время', 1, '249 CHF · в разработке'],
      otn: ['где пара во всей твоей жизни и что тянет вниз', 1, '249 CHF · в разработке'] },
    { n: '«Моя цель — мой путь»', w: '10 личных встреч', p: 'flag',
      put: ['путь к одной большой цели в жизни здесь', 1, 'в разработке'],
      delo: ['путь к цели твоего дела, шаг за шагом', 1, 'в разработке'],
      otn: ['путь к тем отношениям, которых ты хочешь', 1, 'в разработке'] },
    { n: 'Для себя между встречами', w: 'бесплатно, в своём темпе', p: '',
      put: ['«Карта опор» — что держит тебя и что укрепить первым', '../karta-opor/', 'бесплатно'],
      delo: ['«Мой багаж» — что ты умеешь и что из этого нужно здесь', '../#p-bagazh', 'бесплатно · новое'],
      otn: ['тесты «Быть рядом и быть собой» и «Роза любви»', '../blizost/', 'бесплатно'] }
  ];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pic = function (n, cls) { return '<picture class="' + cls + '"><source srcset="/put/img/' + n + '.webp" type="image/webp"><img src="/put/img/' + n + '.jpg" width="900" height="1205" loading="lazy" alt=""></picture>'; };
  var CSS = '.tri-band,.tri-tools{margin-top:34px}'
    + '.tri-tabs{display:flex;gap:8px;padding-top:18px;margin-bottom:-6px}.tri-tabs a{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:8px;text-align:center;padding:10px 12px;border-radius:12px;border:1.5px solid color-mix(in srgb,var(--brown) 25%,transparent);background:var(--paper);color:var(--ink);font:700 .9rem/1.25 var(--body,system-ui);text-decoration:none;-webkit-tap-highlight-color:transparent}'
    + '.tri-tabs a:hover{border-color:var(--brown)}.tri-tabs a[aria-current]{background:var(--brown);border-color:var(--brown);color:var(--paper)}'
    + '@media (max-width:640px){.tri-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.tri-tabs a{font-size:.84rem;padding:9px 8px}}'
    + '.tri-head h2{font-size:clamp(1.5rem,3.2vw,2rem)}.tri-head p{color:var(--muted);max-width:66ch;margin-top:6px}.tri-osn{display:inline-block;margin-top:8px;font-weight:700;font-size:.92rem;color:var(--brown);text-underline-offset:4px}'
    + '.tri-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}'
    + '.tri-card{display:grid;grid-template-columns:62px minmax(0,1fr);gap:4px 14px;align-items:start;background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:12px 14px;text-decoration:none;color:var(--ink);transition:border-color .15s}'
    + 'a.tri-card:hover{border-color:var(--brown)}.tri-card.here{border:1.5px solid var(--brown);background:color-mix(in srgb,var(--brown) 7%,var(--paper))}'
    + '.tri-bowl{grid-row:span 2;display:block;width:62px;aspect-ratio:3/4;overflow:hidden;border-radius:10px}.tri-bowl img{width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply}'
    + '.tri-t{display:flex;flex-direction:column;gap:2px;min-width:0}.tri-t small{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--muted)}'
    + '.tri-t b{font-family:var(--display);font-weight:400;font-size:1.22rem;line-height:1.2}.tri-t span{font-size:.88rem;color:var(--muted);line-height:1.45}'
    + '.tri-go{font-weight:700;font-size:.86rem;color:var(--brown)}.tri-card.here .tri-go{color:var(--ink)}'
    + '@media (max-width:860px){.tri-cards{grid-template-columns:1fr}}'
    + '.tt{margin-top:16px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--paper)}'
    + '.tt-row[hidden]{display:none!important}.tt-row{display:grid;grid-template-columns:minmax(0,1.05fr) repeat(3,minmax(0,1fr))}.tt-row+.tt-row{border-top:1px solid var(--line)}'
    + '.tt-row>div{padding:11px 13px;font-size:.9rem;line-height:1.45;min-width:0}.tt-row>div+div{border-left:1px solid var(--line)}'
    + '.tt-hd>div{font-weight:700;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--bg)}'
    + '.tt-row>div.here{background:color-mix(in srgb,var(--brown) 7%,var(--paper))}.tt-hd>div.here{color:var(--ink);background:color-mix(in srgb,var(--brown) 14%,var(--bg))}'
    + '.tt-n b{display:block;font-size:.98rem}.tt-n span{color:var(--muted);font-size:.82rem}'
    + '.tt-c{display:flex;flex-direction:column}.tt-c>a{display:flex;flex-direction:column;flex:1 1 auto;color:inherit;text-decoration:none}.tt-c a:hover .tt-t{text-decoration:underline}.tt-c .tt-t{margin-bottom:8px}'
    + '.tt-c em{display:block;align-self:flex-start;margin-top:auto;font-style:normal;font-size:.74rem;font-weight:700;border-radius:999px;padding:1px 8px;background:color-mix(in srgb,var(--mustard) 22%,transparent)}'
    + '.tt-c em.free{background:color-mix(in srgb,var(--sage) 30%,transparent)}.tt-c i{display:none;font-style:normal;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted)}'
    + '@media (max-width:760px){.tt-hd{display:none!important}.tt-row{display:flex;flex-direction:column}.tt-row>div+div{border-left:none;border-top:1px dashed var(--line)}.tt-c i{display:block}.tt-row>div.here{order:-1}.tt-row>.tt-n{order:-2;background:var(--bg)}.tt-row>div:not(.here):not(.tt-n){font-size:.84rem}}'
    + '.tt-all{margin-top:10px;font:700 .9rem/1 var(--body,system-ui);color:var(--ink);background:var(--paper);border:1.5px solid color-mix(in srgb,var(--brown) 35%,transparent);border-radius:12px;padding:10px 14px;cursor:pointer}.tt-all:hover{border-color:var(--brown)}'
    + '.tt-note{color:var(--muted);font-size:.9rem;margin-top:10px;max-width:72ch}';

  function band() {
    var el = document.getElementById('triBand'); if (!el) return;
    el.className = 'tri-band'; el.setAttribute('aria-labelledby', 'tri-h');
    el.innerHTML = '<div class="tri-head"><h2 id="tri-h">Три пути — один метод</h2><p>Жизнь в новой стране, своё дело и отношения растут по одним и тем же восьми ступеням — снизу вверх, от опоры к целому. На каждом пути свои трудности, а инструменты одни. Выбери, о чём ты сейчас.</p><a class="tri-osn" href="../osnova/">На чём стоит метод — спиральная динамика →</a></div>'
      + '<div class="tri-cards">' + P.map(function (p, i) {
        var cur = p.k === here, tag = cur ? 'div' : 'a';
        return '<' + tag + ' class="tri-card' + (cur ? ' here' : '') + '"' + (cur ? ' aria-current="page"' : ' href="' + p.h + '"') + '>' + pic(p.img, 'tri-bowl')
          + '<span class="tri-t"><small>Путь ' + (i + 1) + '</small><b>' + esc(p.n) + '</b><span>' + esc(p.d) + '</span></span>'
          + '<span class="tri-go">' + (cur ? 'Ты здесь' : 'Открыть путь →') + '</span></' + tag + '>';
      }).join('') + '</div>';
  }
  function cell(c, row, p) {
    var link = c[1] === 1 ? '../#p-' + row.p : c[1], m = c[2];
    var inner = '<i>' + esc(p.n) + '</i><span class="tt-t">' + esc(c[0]) + '</span>' + (m ? '<em' + (/^бесплатно/.test(m) ? ' class="free"' : '') + '>' + esc(m) + '</em>' : '');
    return '<div class="tt-c' + (p.k === here ? ' here' : '') + '">' + (link ? '<a href="' + link + '">' + inner + '</a>' : inner) + '</div>';
  }
  /* 15.10.2026, Ирина: «сделай ровненько цены» — пометка цены стоит отдельной строкой внизу клетки, в одной линии по всей строке таблицы. */
  var MORE = 4;   // сколько строк видно сразу, остальные — по кнопке (на телефоне таблица длинная)
  function tools() {
    var el = document.getElementById('triTools'); if (!el) return;
    el.className = 'tri-tools'; el.setAttribute('aria-labelledby', 'tt-h');
    el.innerHTML = '<div class="tri-head"><h2 id="tt-h">Работа со мной на трёх путях</h2><p>Метод один, и работа со мной одна — меняется только тема. Вот с чем ты можешь прийти ко мне на каждом пути.</p></div>'
      + '<div class="tt" role="table" aria-label="Работа со мной на трёх путях"><div class="tt-row tt-hd" role="row"><div role="columnheader">С чем прийти</div>'
      + P.map(function (p) { return '<div role="columnheader"' + (p.k === here ? ' class="here"' : '') + '>' + esc(p.n) + '</div>'; }).join('') + '</div>'
      + T.map(function (r, i) {
        return '<div class="tt-row" role="row"' + (i >= MORE ? ' data-more hidden' : '') + '><div class="tt-n" role="rowheader"><b>' + esc(r.n) + '</b><span>' + esc(r.w) + '</span></div>'
          + P.map(function (p) { return cell(r[p.k], r, p); }).join('') + '</div>';
      }).join('') + '</div>'
      + '<button type="button" class="tt-all" aria-expanded="false">Показать всё · ещё ' + (T.length - MORE) + '</button>'
      + '<p class="tt-note">Не знаешь, что выбрать, — начни со знакомства: за 30 минут станет понятно, на какой ты ступени и какой формат тебе подходит.</p>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tt-all'); if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('#triTools [data-more]').forEach(function (r) { r.hidden = !open; });
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    b.textContent = open ? 'Свернуть' : 'Показать всё · ещё ' + (T.length - MORE);
  });
  /* Окно ступени — работа со мной (15.10.2026, Ирина: «больше показывать, что я как коуч могу дать… лишнего не надо…
     для остального — всплывающее окошко «Свои люди»»). c = { t: [[тема, что меняется], …], f: формат со мной, me: инструмент для себя, sv: ссылки «Свои люди» }. */
  var MEETB = 'https://t.me/IrynaNeuroCoach';
  function coach(k, c, vars, name) {
    if (!c) return '';
    var sl = window.SvoiOkno ? SvoiOkno.button(c.sv || [], 'Практическое к ступени «' + name + '»') : '';
    return '<div class="co" style="' + vars + '"><div class="co-main">'
      + '<div class="co-head"><div class="eyebrow">Работа со мной</div><h3>Что мы можем проработать вместе</h3>'
      + '<p>' + esc(c.lead || 'Узнаёшь себя? С этим ко мне приходят на этой ступени. Ты приносишь свою ситуацию, а я помогаю увидеть её целиком и найти твой следующий шаг.') + '</p></div>'
      + '<ol class="co-themes">' + c.t.map(function (x) { return '<li><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></li>'; }).join('') + '</ol>'
      + '<p class="co-how"><b>Как мы работаем.</b> Твои собственные слова и образы, метафорические карты и один маленький шаг до следующей встречи. Это коучинг для тебя: мы работаем с тем, что можешь изменить ты.</p>'
      + '<div class="co-acts"><a class="co-btn free" href="' + MEETB + '" target="_blank" rel="noopener"><b>Знакомство, 30 минут</b><span>бесплатно · слово ВСТРЕЧА в Telegram</span></a>'
      + (c.f ? '<a class="co-btn price" href="' + c.f.h + '"><b>' + esc(c.f.t) + '</b><span>' + esc(c.f.d) + ' · ' + esc(c.f.m) + '</span></a>' : '') + '</div></div>'
      + '<div class="co-side">' + (c.me ? '<a class="co-card me" href="' + c.me.h + '"><small>Для себя между встречами</small><b>' + esc(c.me.t) + ' →</b><span>' + esc(c.me.d) + '</span><em>' + esc(c.me.m) + '</em></a>' : '')
      + sl + '</div>'
      + '<p class="co-steps">Только встаёшь на эту ступень — начни с практического. Уже стоишь твёрдо — поможет инструмент для себя. Стало тесно — время для работы со мной.</p></div>';
  }
  CSS += '.co{border:1.5px solid color-mix(in srgb,var(--lc) 55%,var(--line));border-radius:22px;padding:clamp(16px,2.6vw,28px);display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:16px 24px;background:color-mix(in srgb,var(--lf) 30%,var(--paper))}'
    + '@media (max-width:820px){.co{grid-template-columns:1fr}}'
    + '.co-main,.co-side{min-width:0}.co-head h3{font-size:clamp(1.35rem,2.6vw,1.75rem);margin-top:4px}.co-head p{color:var(--muted);margin-top:6px;font-size:.95rem;max-width:62ch}'
    + '.co-themes{list-style:none;counter-reset:t;padding:0;margin:16px 0 0;display:grid;gap:12px}'
    + '.co-themes li{counter-increment:t;display:grid;grid-template-columns:30px minmax(0,1fr);column-gap:12px;align-items:start}'
    + '.co-themes li::before{content:counter(t);grid-row:span 2;width:28px;height:28px;border-radius:50%;background:var(--lc);color:var(--paper);display:grid;place-items:center;font-weight:700;font-size:.85rem}'
    + '.co-themes b{font-size:1.02rem;line-height:1.35}.co-themes span{color:var(--muted);font-size:.92rem;line-height:1.5}'
    + '.co-how{font-size:.9rem;color:var(--muted);margin-top:14px;max-width:66ch}.co-how b{color:var(--ink)}'
    + '.co-acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}'
    + '.co-btn{display:flex;flex-direction:column;gap:2px;text-decoration:none;border-radius:12px;padding:11px 16px;line-height:1.3;color:var(--paper);min-width:0;max-width:100%}'
    + '.co-btn b{font-size:.95rem}.co-btn span{font-size:.8rem;opacity:.9}.co-btn.free{background:var(--sage)}.co-btn.price{background:var(--mustard)}.co-btn:hover{filter:brightness(1.06)}'
    + '.co-side{display:flex;flex-direction:column;gap:10px}'
    + '.co-card{display:flex;flex-direction:column;gap:3px;background:var(--paper);border:1px solid var(--line);border-left:5px solid var(--mustard);border-radius:14px;padding:12px 14px;text-decoration:none;color:var(--ink)}'
    + '.co-card:hover{border-color:var(--lc)}.co-card small{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted)}'
    + '.co-card b{font-size:.98rem;line-height:1.35}.co-card span{font-size:.86rem;color:var(--muted)}.co-card em{font-style:normal;font-size:.78rem;font-weight:700;color:var(--mustard)}'
    + '.co-steps{grid-column:1/-1;font-size:.86rem;color:var(--muted);border-top:1px dashed var(--line);padding-top:10px;margin:0}';
  window.TRI = {
    here: here,
    coach: coach,
  };
  /* Вкладки наверху «Твоего пути» (Ирина, 15.10.2026: вариант 2 — «Жизнь в новой стране · Своё дело · Отношения · Основа метода»).
     Стоят на put/, delo/, otnosheniya/ и osnova/ (там скрипт подключён с data-path="osnova"). */
  function tabsBar() {
    var main = document.querySelector('main.page'); if (!main || document.querySelector('.tri-tabs')) return;
    var T = P.map(function (p) { return { k: p.k, h: p.h, n: p.n }; }).concat([{ k: 'osnova', h: '../osnova/', n: 'Основа метода' }]);
    var nav = document.createElement('nav'); nav.className = 'tri-tabs'; nav.setAttribute('aria-label', 'Твой путь');
    nav.innerHTML = T.map(function (t) { return '<a href="' + t.h + '"' + (t.k === here ? ' aria-current="page"' : '') + '>' + esc(t.n) + '</a>'; }).join('');
    main.insertBefore(nav, main.firstElementChild);
  }
  function fromHash() {
    var m = /^#stupen-([1-8])$/.exec(location.hash || ''); if (!m) return;
    var b = document.querySelector('#trail [data-k="' + (m[1] - 1) + '"]'); if (b) b.click();
  }
  function run() {
    var st = document.createElement('style'); st.id = 'tri-css'; st.textContent = CSS; document.head.appendChild(st);
    tabsBar(); band(); tools(); fromHash();
    window.addEventListener('hashchange', fromHash);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
