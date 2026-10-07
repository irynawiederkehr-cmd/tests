/* Отзывы клиенток, листаются вбок. Только коучинговые отзывы (терапевтические — только в психологии).
   Разметка на странице: <div class="reviews-slot"></div> — блок появится на её месте.
   Главная страница рисует отзывы сама (там плашки открывают окна продуктов); тексты держать одинаковыми. */
(function(){
  var TG = 'https://t.me/IrynaNeuroCoach', HOME = 'https://voznesenskaya.ch/';
  var R = [
    {p:'Коуч-сессии · своя цель', h:HOME + '#path', t:'Проводнику нужен проводник. Благодарю за коуч-сессии, которые дали мне уверенность и веру в свою цель, а самое главное — я начала действовать и идти к ней.'},
    {p:'«Мой фундамент»', h:HOME + '#path', t:'Осознание, что мои решения и разрешения себе упираются в ценности, перевернуло мой мир. Прошло два месяца после нашей исследовательской работы, а я до сих пор не представляю, как жила без этого. Простые вопросы, которые попадают в точку, понимание, принятие и тепло в словах — и вуаля, результат. Работа с вами — как работа ювелира по огранке бриллианта. Вы не спешите и шаг за шагом, вопрос за вопросом снимаете слой за слоем каменную броню, чтобы увидеть истинную суть. С вами родилась я.'},
    {p:'«Мой фундамент»', h:HOME + '#path', t:'Я очень благодарна тебе за нашу работу с ценностями. Прошло уже два с половиной месяца, а я до сих пор чувствую, насколько глубокой и важной она была для меня. Я смогла по-новому увидеть, что для меня действительно важно, чему я хочу отдавать своё время, силы и внимание. Постепенно эти ценности стали моей опорой в повседневной жизни. Особенно я чувствую это, когда передо мной стоит сложный выбор. Теперь я могу остановиться и спросить себя: „Что для меня сейчас самое важное? Какое решение будет в согласии со мной?“ И выбирать становится легче. Появляется больше ясности и уверенности в себе. Спасибо тебе за глубину, бережность и за то, что помогла мне найти эту опору внутри себя.'},
    {p:'Бот «Гайд по Швейцарии»', h:'https://t.me/swisscompass_bot', t:'Отличный бот для адаптации в Швейцарии! Очень помогает разобраться в местных нюансах — от бытовых вопросов до официальной переписки. Я воспользовалась рекомендациями по написанию письма, всё сделала по советам бота и получила положительный результат. Это сильно сэкономило мне время и нервы. Рекомендую всем, кто только переехал или хочет чувствовать себя увереннее в Швейцарии.'},
    {p:'Личные коуч-сессии', t:'Я пришла на сессию, потому что собираюсь учиться на психотехнолога, и решила попробовать себя в роли клиента. Сказать, что после одной встречи меня перевернуло с ног на голову, — ничего не сказать. Я была готова, что вскроется нечто, но не к тому, что это произойдёт в той области жизни, где я думала, что всё в порядке. Это твоё ювелирное мастерство — выявить то, что действительно требует внимания. Очень мягко и бережно было работать с переживаниями, кусочек за кусочком появилось много принятия себя. Теперь я не только не боюсь идти в проработку, но и идти учиться. Огромная благодарность тебе!'},
    {p:'Личные коуч-сессии', t:'Работает, потому что очень точный процесс, и то, как он устроен, приносит результаты даже в самых скомканных и зажатых вещах. А ты — ведущий. Ты маяк, который светит. Это же каким надо быть человеком, чтобы тебе доверились в том, о чём никому не рассказывают. Вообще не потратила время зря. Я довольна.'},
    {p:'Личные коуч-сессии', t:'Благодарю тебя за нашу работу. Очень откликается твой бережный подход и то, что мы работаем не только через разговор, но и через тело. Результат ощущается сразу после сессии — становится легче, как будто уходит внутреннее напряжение, появляется больше спокойствия и ясности. А потом изменения начинают проявляться и в жизни. Я стала чаще выбирать себя, лучше видеть свои автоматические реакции и меньше проваливаться в привычные сценарии. Сейчас мне важнее оставаться собой и доверять себе. Спасибо тебе за поддержку и безопасное пространство.'},
    {p:'Личные коуч-сессии', t:'Хочу выразить тебе глубочайшую благодарность за терпение, внимательность, мягкость и человечность. И главное — за профессионализм в распутывании моей почти детективной истории. Благодаря твоему подходу я смогла раскрутить весь клубок воспоминаний, найти взаимосвязь между ними и понять многие смыслы, которые теперь помогают мне в решении других вопросов. И особенная благодарность за то, что помогла всё это последовательно структурировать в отдельный файл. Это тоже очень помогает.'},
    {p:'Бот «Гайд по Швейцарии»', h:'https://t.me/swisscompass_bot', t:'Спасибо, что ботом можно пользоваться бесплатно. Он очень выручает, когда нужно быстро понять, что делать здесь, в Швейцарии, и не у кого спросить.'},
    {p:'«Моя цель — мой путь»', h:HOME + '#path', t:'Спасибо за нашу долгую работу. Она перевернула моё сознание. Я на себе поняла, что когда меняешь мышление, меняется и жизнь.'},
    {p:'«Моя цель — мой путь»', h:HOME + '#path', t:'У меня получилось начать строить своё дело. Пока с малого, но оно уже моё, и я иду дальше.'}
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
      var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = 'Читать полностью'; q.insertAdjacentElement('afterend', b);
      b.addEventListener('click', function(){ var o = c.classList.toggle('open'); b.textContent = o ? 'Свернуть' : 'Читать полностью'; }); });
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
  document.querySelectorAll('.reviews-slot').forEach(function(slot, n){
    var id = 'rvs' + n;
    slot.innerHTML = '<section class="rvs" aria-labelledby="' + id + 'h"><div class="eyebrow">Отзывы клиентов</div><h2 id="' + id + 'h">Что говорят клиенты</h2>'
      + '<p class="rvs-lead">Слова клиентов из сообщений, из Instagram и из живых разговоров после встреч.</p>'
      + '<div class="rvs-track" id="' + id + '" tabindex="0" aria-label="Отзывы, листаются вбок">'
      + R.map(function(r){ return '<figure class="rvs-card">' + (r.h ? '<a class="rvs-p" href="' + r.h + '" target="_blank" rel="noopener">' + esc(r.p) + '</a>' : '<span class="rvs-p">' + esc(r.p) + '</span>') + '<blockquote>' + esc(r.t) + '</blockquote><figcaption>Отзыв клиентки</figcaption></figure>'; }).join('')
      + '<figure class="rvs-card rvs-cta"><blockquote>Ты тоже была у меня на встрече, пользовалась ботом или тестом? Мне будет очень ценно услышать, что изменилось.</blockquote><a class="rvs-btn" href="' + TG + '" target="_blank" rel="noopener">Оставить отзыв</a><figcaption>Напиши в Telegram слово <span class="rvs-cw">ОТЗЫВ</span></figcaption></figure>'
      + '</div><div class="rvs-nav"><button type="button" data-d="-1" aria-label="Предыдущий отзыв">←</button><button type="button" data-d="1" aria-label="Следующий отзыв">→</button></div></section>';
    var t = slot.querySelector('.rvs-track');
    clampMore(t, '.rvs-card', 'rvs-more');
    slot.querySelectorAll('[data-d]').forEach(function(b){ b.addEventListener('click', function(){ var c = t.querySelector('.rvs-card'); t.scrollBy({ left: (+b.dataset.d) * ((c ? c.offsetWidth : 300) + 14), behavior: 'smooth' }); }); });
  });
})();
