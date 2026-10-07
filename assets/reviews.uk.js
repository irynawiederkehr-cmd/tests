/* Отзывы клиенток, листаются вбок. Только коучинговые отзывы (терапевтические — только в психологии).
   Разметка на странице: <div class="reviews-slot"></div> — блок появится на её месте.
   Главная страница рисует отзывы сама (там плашки открывают окна продуктов); тексты держать одинаковыми. */
(function(){
  var TG = 'https://t.me/IrynaNeuroCoach', HOME = 'https://voznesenskaya.ch/uk/';
  var R = [
    {p:'Коуч-сесії · своя мета', h:HOME + '#path', t:'Провідникові потрібен провідник. Дякую за коуч-сесії, які дали мені впевненість і віру у свою мету, а найголовніше — я почала діяти й іти до неї.'},
    {p:'«Мій фундамент»', h:HOME + '#path', t:'Усвідомлення, що мої рішення і мої дозволи собі впираються в цінності, перевернуло мій світ. Минуло два місяці після нашої дослідницької роботи, а я досі не уявляю, як жила без цього. Прості запитання, які влучають у точку, розуміння, прийняття й тепло в словах — і вуаля, результат. Робота з вами — як робота ювеліра, що гранує діамант. Ви не поспішаєте і крок за кроком, запитання за запитанням знімаєте шар за шаром кам’яну броню, щоб побачити справжню суть. З вами народилася я.'},
    {p:'«Мій фундамент»', h:HOME + '#path', t:'Я дуже вдячна тобі за нашу роботу з цінностями. Минуло вже два з половиною місяці, а я досі відчуваю, наскільки глибокою і важливою вона була для мене. Я змогла по-новому побачити, що для мене справді важливо, чому я хочу віддавати свій час, сили й увагу. Поступово ці цінності стали моєю опорою в повсякденному житті. Особливо я відчуваю це, коли переді мною стоїть складний вибір. Тепер я можу зупинитися й запитати себе: „Що для мене зараз найважливіше? Яке рішення буде в згоді зі мною?“ І вибирати стає легше. З’являється більше ясності й упевненості в собі. Дякую тобі за глибину, дбайливість і за те, що допомогла мені знайти цю опору всередині себе.'},
    {p:'Бот «Гайд по Швейцарії»', h:'https://t.me/swisscompass_bot', t:'Чудовий бот для адаптації у Швейцарії! Дуже допомагає розібратися в місцевих нюансах — від побутових питань до офіційного листування. Я скористалася рекомендаціями щодо написання листа, усе зробила за порадами бота й отримала позитивний результат. Це дуже заощадило мені час і нерви. Рекомендую всім, хто щойно переїхав або хоче почуватися впевненіше у Швейцарії.'},
    {p:'Особисті коуч-сесії', t:'Я прийшла на сесію, бо збираюся вчитися на психотехнолога, і вирішила спробувати себе в ролі клієнтки. Сказати, що після однієї зустрічі мене перевернуло з ніг на голову, — нічого не сказати. Я була готова, що відкриється щось, але не до того, що це станеться в тій сфері життя, де я думала, що все гаразд. Це твоя ювелірна майстерність — виявити те, що справді потребує уваги. Дуже м’яко й дбайливо було працювати з переживаннями, шматочок за шматочком з’явилося багато прийняття себе. Тепер я не лише не боюся йти в опрацювання, а й іти вчитися. Величезна вдячність тобі!'},
    {p:'Особисті коуч-сесії', t:'Працює, бо це дуже точний процес, і те, як він побудований, приносить результати навіть у найзім’ятіших і найзатиснутіших речах. А ти — ведуча. Ти маяк, що світить. Це ж якою треба бути людиною, щоб тобі довірилися в тому, про що нікому не розповідають. Зовсім не змарнувала час. Я задоволена.'},
    {p:'Особисті коуч-сесії', t:'Дякую тобі за нашу роботу. Дуже відгукується твій дбайливий підхід і те, що ми працюємо не лише через розмову, а й через тіло. Результат відчувається одразу після сесії — стає легше, ніби йде внутрішня напруга, з’являється більше спокою та ясності. А потім зміни починають проявлятися і в житті. Я стала частіше обирати себе, краще бачити свої автоматичні реакції й менше провалюватися у звичні сценарії. Зараз мені важливіше залишатися собою і довіряти собі. Дякую тобі за підтримку й безпечний простір.'},
    {p:'Особисті коуч-сесії', t:'Хочу висловити тобі найглибшу вдячність за терпіння, уважність, м’якість і людяність. І головне — за професіоналізм у розплутуванні моєї майже детективної історії. Завдяки твоєму підходу я змогла розмотати весь клубок спогадів, знайти взаємозв’язок між ними й зрозуміти багато смислів, які тепер допомагають мені у вирішенні інших питань. І особлива вдячність за те, що допомогла все це послідовно структурувати в окремий файл. Це теж дуже допомагає.'},
  ];
  var css = '.rvs{display:flex;flex-direction:column;gap:14px;margin:48px 0 8px}'
  + '.rvs .eyebrow{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--muted,#7A6E62)}'
  + '.rvs h2{margin:0;font-family:var(--display,"Forum",Georgia,serif);font-weight:400;font-size:clamp(1.9rem,4vw,2.6rem);line-height:1.12}'
  + '.rvs-lead{margin:0;color:var(--muted,#7A6E62)}'
  + '.rvs-track{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:4px 2px 10px;scrollbar-width:none;outline:none}'
  + '.rvs-track::-webkit-scrollbar{display:none}'
  + '.rvs-card{flex:0 0 min(86%,380px);scroll-snap-align:start;margin:0;background:var(--paper,#FFFCF8);border:1.5px solid color-mix(in srgb,var(--mustard,#B98324) 35%,var(--line,#E5D9C9));border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:14px;box-sizing:border-box}'
  + '.rvs-card blockquote{margin:0;flex:1;font-family:var(--display,"Forum",Georgia,serif);font-size:1.12rem;line-height:1.4;color:var(--ink,#2F2924)}'
  + '.rvs-card blockquote::before{content:"«";color:var(--mustard,#B98324)}.rvs-card blockquote::after{content:"»";color:var(--mustard,#B98324)}'
  + '.rvs-card figcaption{margin-top:auto;font-size:.84rem;font-weight:700;color:var(--brown,#6E4F3C)}'
  + '.rvs-p{align-self:flex-start;font-size:.74rem;font-weight:700;letter-spacing:.04em;color:var(--sage,#66704F);background:var(--sage-soft,#E3E6D6);border-radius:999px;padding:5px 12px;text-decoration:none}'
  + 'a.rvs-p:hover{background:var(--sage,#66704F);color:var(--paper,#FFFCF8)}'
  + '.rvs-cta{background:var(--mustard-soft,#F3E3C2)!important}'
  + '.rvs-cta blockquote::before,.rvs-cta blockquote::after{content:none}'
  + '.rvs-cta a.rvs-btn{align-self:flex-start;font-weight:700;font-size:.95rem;color:#fff;background:#4F5E3E;border-radius:999px;padding:12px 22px;text-decoration:none}'
  + '.rvs-cta figcaption{font-weight:400;color:var(--muted,#7A6E62)}'
  + '.rvs-cw{display:inline-block;font-weight:700;letter-spacing:.12em;color:var(--brown,#6E4F3C);background:var(--mustard-soft,#F3E3C2);border-radius:6px;padding:0 6px}'
  + '.rvs-card blockquote{flex:0 1 auto;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:8;overflow:hidden}.rvs-card.open blockquote{-webkit-line-clamp:unset;display:block}'
  + '.rvs-more{align-self:flex-start;margin-top:0;font:inherit;font-size:.86rem;font-weight:700;color:var(--brown,#6E4F3C);background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'
  + '.rvs-nav{display:flex;gap:10px;justify-content:flex-end}'
  + '.rvs-nav button{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--line,#E5D9C9);background:var(--paper,#FFFCF8);color:var(--brown,#6E4F3C);font-size:1.05rem;cursor:pointer}'
  + '@media (hover:none){.rvs-nav{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function clampMore(track, cardSel, cls){        // длинный отзыв: 8 строк и «Читать полностью»
    track.querySelectorAll(cardSel).forEach(function(c){ var q = c.querySelector('blockquote'); if (!q || q.scrollHeight <= q.clientHeight + 2) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = 'Читати повністю'; q.insertAdjacentElement('afterend', b);
      b.addEventListener('click', function(){ var o = c.classList.toggle('open'); b.textContent = o ? 'Згорнути' : 'Читати повністю'; }); });
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
  document.querySelectorAll('.reviews-slot').forEach(function(slot, n){
    var id = 'rvs' + n;
    slot.innerHTML = '<section class="rvs" aria-labelledby="' + id + 'h"><div class="eyebrow">Відгуки клієнтів</div><h2 id="' + id + 'h">Що кажуть клієнти</h2>'
      + '<p class="rvs-lead">Слова клієнтів із повідомлень, з Instagram і з живих розмов після зустрічей.</p>'
      + '<div class="rvs-track" id="' + id + '" tabindex="0" aria-label="Відгуки, гортаються вбік">'
      + R.map(function(r){ return '<figure class="rvs-card">' + (r.h ? '<a class="rvs-p" href="' + r.h + '" target="_blank" rel="noopener">' + esc(r.p) + '</a>' : '<span class="rvs-p">' + esc(r.p) + '</span>') + '<blockquote>' + esc(r.t) + '</blockquote><figcaption>Відгук клієнтки</figcaption></figure>'; }).join('')
      + '<figure class="rvs-card rvs-cta"><blockquote>Ти теж була в мене на зустрічі, користувалася ботом чи тестом? Мені буде дуже цінно почути, що змінилося.</blockquote><a class="rvs-btn" href="' + TG + '" target="_blank" rel="noopener">Залишити відгук</a><figcaption>Напиши в Telegram слово <span class="rvs-cw">ОТЗЫВ</span></figcaption></figure>'
      + '</div><div class="rvs-nav"><button type="button" data-d="-1" aria-label="Попередній відгук">←</button><button type="button" data-d="1" aria-label="Наступний відгук">→</button></div></section>';
    var t = slot.querySelector('.rvs-track');
    clampMore(t, '.rvs-card', 'rvs-more');
    slot.querySelectorAll('[data-d]').forEach(function(b){ b.addEventListener('click', function(){ var c = t.querySelector('.rvs-card'); t.scrollBy({ left: (+b.dataset.d) * ((c ? c.offsetWidth : 300) + 14), behavior: 'smooth' }); }); });
  });
})();
