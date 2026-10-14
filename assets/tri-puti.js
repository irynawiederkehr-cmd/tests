/* «Твой путь» — три пути одного метода «Ступени. Твой путь в новой стране» (КОПИЯ 14.10.2026).
   Просьба Ирины: «в твой путь сделать 3 пути: путь адаптации, путь реализации в своём деле и бизнесе, путь об отношениях
   между мужчиной и женщиной. В каждом из этих путей будут переплетаться одни и те же инструменты, просто адаптироваться под тему».
   Один файл на три страницы: put/ (жизнь в новой стране), delo/ (своё дело), otnosheniya/ (отношения).
   Подключение: <script src="/assets/tri-puti.js" data-path="put|delo|otn" defer></script>
   Рисует: полосу «Три пути» (#triBand), «Одни инструменты на трёх путях» (#triTools), в окне ступени — «Эта ступень
   на других путях» (TRI.cross(k)); открывает ступень по ссылке …/#stupen-N. Модель и цвета ступеней клиентке не называем. */
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
  /* Одни инструменты — на каждом пути о своём. m — пометка как на главной: бесплатно, новое, цена. */
  var T = [
    { n: 'Где я сейчас', w: 'тест на 15–20 минут',
      put: ['«Ступени устойчивости» — какая ступень жизни держит, а какая поскрипывает', '../stupeni/', 'бесплатно'],
      delo: ['«Ступени своего дела» — где поскрипывает дело', '', 'новое'],
      otn: ['«Быть рядом и быть собой» и «Роза любви» — на чём держится ваша пара', '../blizost/', 'бесплатно'] },
    { n: '«Карта опор»', w: 'рабочий лист на 10–15 минут',
      put: ['что держит тебя на каждой ступени жизни и какую опору укрепить первой', '../karta-opor/', 'бесплатно'],
      delo: ['опоры дела — подушка, первые клиенты, цена, порядок, люди', '', 'новое'],
      otn: ['опоры пары — безопасность, «мы», договорённости, близость', '', 'новое'] },
    { n: '«Мой круг»', w: 'рабочий лист', p: 'krug',
      put: ['кто рядом здесь и там и кому можно позвонить ночью', 1, 'новое'],
      delo: ['круг доверия — первые клиенты, наставница, партнёры', 1, 'новое'],
      otn: ['круг вашей пары — с кем хорошо вам обоим и кто поддержит вас двоих', 1, 'новое'] },
    { n: '«Мои границы»', w: 'рабочий лист', p: 'granicy',
      put: ['где тебе нужно сказать «нет»', 1, 'новое'],
      delo: ['твоё время, твоя цена и клиенты, которые хотят слишком много', 1, 'новое'],
      otn: ['моё, его и наше — сказать «нет» и не поссориться', 1, 'новое'] },
    { n: '«Мой багаж»', w: 'рабочий лист', p: 'bagazh',
      put: ['что ты умеешь и что привезла с собой', 1, 'новое'],
      delo: ['опыт, из которого рождается твоё предложение', 1, 'новое'],
      otn: ['что ты принесла в пару из своей семьи — привычки, ожидания, сценарии', 1, 'новое'] },
    { n: '«Знаю, додумываю, боюсь»', w: 'рабочий лист', p: 'gde',
      put: ['твоя жизнь здесь — факты отдельно от страхов', 1, 'новое'],
      delo: ['цифры дела вместо тревоги', 1, 'новое'],
      otn: ['что ты знаешь о нём точно, а что додумываешь', 1, 'новое'] },
    { n: '«Хочу, но не делаю»', w: 'рабочий лист', p: 'hochu',
      put: ['что удерживает тебя от шага', 1, 'новое'],
      delo: ['хочу своё, но не начинаю', 1, 'новое'],
      otn: ['хочу сказать, но молчу', 1, 'новое'] },
    { n: 'Трекер «Мои маленькие шаги»', w: 'онлайн и PDF', p: 'tracker',
      put: ['один шаг в неделю для твоей жизни здесь', 1, 'новое'],
      delo: ['один шаг в неделю для твоего дела', 1, 'новое'],
      otn: ['один шаг в неделю для вас двоих', 1, 'новое'] },
    { n: '«Мой фундамент»', w: 'личная работа, 3 часа', p: 'fund',
      put: ['твои ценности рядом с целью твоей жизни', 1, '249 CHF'],
      delo: ['твои ценности рядом с целью твоего дела', 1, '249 CHF'],
      otn: ['твои ценности рядом с тем, чего ты хочешь в паре', 1, '249 CHF'] },
    { n: '«Разговор с картами»', w: 'личная встреча', p: 'kartami',
      put: ['колода «Чаша, которая собирается заново»', 1, 'новое · 150 CHF'],
      delo: ['колода «От глины к чаше»', 1, 'новое · 150 CHF'],
      otn: ['колода «Две чаши»', 1, 'новое · 150 CHF'] }
  ];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pic = function (n, cls) { return '<picture class="' + cls + '"><source srcset="/put/img/' + n + '.webp" type="image/webp"><img src="/put/img/' + n + '.jpg" width="900" height="1205" loading="lazy" alt=""></picture>'; };
  var CSS = '.tri-band,.tri-tools{margin-top:34px}'
    + '.tri-head h2{font-size:clamp(1.5rem,3.2vw,2rem)}.tri-head p{color:var(--muted);max-width:66ch;margin-top:6px}'
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
    + '.tt-c a{color:inherit;text-decoration:none}.tt-c a:hover .tt-t{text-decoration:underline}.tt-c em{display:inline-block;margin-top:4px;font-style:normal;font-size:.74rem;font-weight:700;border-radius:999px;padding:1px 8px;background:color-mix(in srgb,var(--mustard) 22%,transparent)}'
    + '.tt-c em.free{background:color-mix(in srgb,var(--sage) 30%,transparent)}.tt-c i{display:none;font-style:normal;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted)}'
    + '@media (max-width:760px){.tt-hd{display:none!important}.tt-row{display:flex;flex-direction:column}.tt-row>div+div{border-left:none;border-top:1px dashed var(--line)}.tt-c i{display:block}.tt-row>div.here{order:-1}.tt-row>.tt-n{order:-2;background:var(--bg)}.tt-row>div:not(.here):not(.tt-n){font-size:.84rem}}'
    + '.tt-all{margin-top:10px;font:700 .9rem/1 var(--body,system-ui);color:var(--ink);background:var(--paper);border:1.5px solid color-mix(in srgb,var(--brown) 35%,transparent);border-radius:12px;padding:10px 14px;cursor:pointer}.tt-all:hover{border-color:var(--brown)}'
    + '.tt-note{color:var(--muted);font-size:.9rem;margin-top:10px;max-width:72ch}'
    + '.tri-x{margin-top:18px;border-top:1px solid var(--line);padding-top:14px}.tri-x h3{font-size:1.15rem}.tri-x p{color:var(--muted);font-size:.9rem;margin:4px 0 10px}'
    + '.tri-x-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media (max-width:560px){.tri-x-grid{grid-template-columns:1fr}}'
    + '.tri-x a{display:flex;flex-direction:column;gap:2px;background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:11px 14px;text-decoration:none;color:var(--ink)}.tri-x a:hover{border-color:var(--brown)}'
    + '.tri-x small{font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted)}.tri-x b{font-size:.98rem}';

  function band() {
    var el = document.getElementById('triBand'); if (!el) return;
    el.className = 'tri-band'; el.setAttribute('aria-labelledby', 'tri-h');
    el.innerHTML = '<div class="tri-head"><h2 id="tri-h">Три пути — один метод</h2><p>Жизнь в новой стране, своё дело и отношения растут по одним и тем же восьми ступеням — снизу вверх, от опоры к целому. На каждом пути свои трудности, а инструменты одни. Выбери, о чём ты сейчас.</p></div>'
      + '<div class="tri-cards">' + P.map(function (p, i) {
        var cur = p.k === here, tag = cur ? 'div' : 'a';
        return '<' + tag + ' class="tri-card' + (cur ? ' here' : '') + '"' + (cur ? ' aria-current="page"' : ' href="' + p.h + '"') + '>' + pic(p.img, 'tri-bowl')
          + '<span class="tri-t"><small>Путь ' + (i + 1) + '</small><b>' + esc(p.n) + '</b><span>' + esc(p.d) + '</span></span>'
          + '<span class="tri-go">' + (cur ? 'Ты здесь' : 'Открыть путь →') + '</span></' + tag + '>';
      }).join('') + '</div>';
  }
  function cell(c, row, p) {
    var link = c[1] === 1 ? '../#p-' + row.p : c[1], m = c[2];
    var inner = '<i>' + esc(p.n) + '</i><span class="tt-t">' + esc(c[0]) + '</span>' + (m ? ' <em' + (m === 'бесплатно' ? ' class="free"' : '') + '>' + esc(m) + '</em>' : '');
    return '<div class="tt-c' + (p.k === here ? ' here' : '') + '">' + (link ? '<a href="' + link + '">' + inner + '</a>' : inner) + '</div>';
  }
  var MORE = 5;   // сколько строк видно сразу, остальные — по кнопке (на телефоне таблица длинная)
  function tools() {
    var el = document.getElementById('triTools'); if (!el) return;
    el.className = 'tri-tools'; el.setAttribute('aria-labelledby', 'tt-h');
    el.innerHTML = '<div class="tri-head"><h2 id="tt-h">Одни инструменты на трёх путях</h2><p>Метод один, поэтому и инструменты одни. Тест «где я сейчас», карта опор, мой круг, мои границы, маленькие шаги — на каждом пути они говорят о своём. Освоишь инструмент на одном пути — на другом он уже знаком.</p></div>'
      + '<div class="tt" role="table" aria-label="Инструменты на трёх путях"><div class="tt-row tt-hd" role="row"><div role="columnheader">Инструмент</div>'
      + P.map(function (p) { return '<div role="columnheader"' + (p.k === here ? ' class="here"' : '') + '>' + esc(p.n) + '</div>'; }).join('') + '</div>'
      + T.map(function (r, i) {
        return '<div class="tt-row" role="row"' + (i >= MORE ? ' data-more hidden' : '') + '><div class="tt-n" role="rowheader"><b>' + esc(r.n) + '</b><span>' + esc(r.w) + '</span></div>'
          + P.map(function (p) { return cell(r[p.k], r, p); }).join('') + '</div>';
      }).join('') + '</div>'
      + '<button type="button" class="tt-all" aria-expanded="false">Показать все инструменты · ещё ' + (T.length - MORE) + '</button>'
      + '<p class="tt-note">И ещё три вещи общие для всех путей. В окне каждой ступени есть «Проверь себя», три шага внутри ступени — «Ставлю ногу», «Стою твёрдо», «Тянусь выше» — и то, что поможет на каждом шаге. «Знакомство» на 30 минут, бесплатно, — на любом пути.</p>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tt-all'); if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('#triTools [data-more]').forEach(function (r) { r.hidden = !open; });
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    b.textContent = open ? 'Свернуть' : 'Показать все инструменты · ещё ' + (T.length - MORE);
  });
  window.TRI = {
    here: here,
    cross: function (k) {
      var o = P.filter(function (p) { return p.k !== here; });
      return '<div class="tri-x"><h3>Эта ступень на других путях</h3><p>Ступень с тем же номером на другом пути отвечает на тот же вопрос, только о другой части жизни.</p><div class="tri-x-grid">'
        + o.map(function (p) { return '<a href="' + p.h + '#stupen-' + (k + 1) + '"><small>' + esc(p.n) + ' · ступень ' + (k + 1) + '</small><b>' + esc(S[p.k][k]) + ' →</b></a>'; }).join('') + '</div></div>';
    }
  };
  function fromHash() {
    var m = /^#stupen-([1-8])$/.exec(location.hash || ''); if (!m) return;
    var b = document.querySelector('#trail [data-k="' + (m[1] - 1) + '"]'); if (b) b.click();
  }
  function run() {
    var st = document.createElement('style'); st.id = 'tri-css'; st.textContent = CSS; document.head.appendChild(st);
    band(); tools(); fromHash();
    window.addEventListener('hashchange', fromHash);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
