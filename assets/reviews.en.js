/* Отзывы клиенток, листаются вбок. Только коучинговые отзывы (терапевтические — только в психологии).
   Разметка на странице: <div class="reviews-slot"></div> — блок появится на её месте.
   Главная страница рисует отзывы сама (там плашки открывают окна продуктов); тексты держать одинаковыми. */
(function(){
  var TG = 'https://t.me/IrynaNeuroCoach', HOME = 'https://voznesenskaya.ch/en/';
  var R = [
    {p:'Coaching sessions · your own goal', h:HOME + '#path', t:'Even a guide needs a guide. Thank you for the coaching sessions that gave me confidence and belief in my goal, and most importantly, I started taking action and moving towards it.'},
    {p:'“My foundation”', h:HOME + '#path', t:'Realising that my decisions, and what I allow myself, rest on my values turned my world upside down. Two months have passed since our exploratory work, and I still can’t imagine how I lived without it. Simple questions that hit the mark, understanding, acceptance and warmth in your words — and voilà, the result. Working with you is like a jeweller cutting a diamond. You don’t rush, and step by step, question by question, you remove the stone armour layer by layer to reveal the true essence. With you, I was born.'},
    {p:'The Swiss Guide bot', h:'https://t.me/swisscompass_bot', t:'A great bot for settling into Switzerland! It really helps you understand the local nuances — from everyday questions to official correspondence. I used its tips on writing a letter, did everything as the bot advised and got a positive result. It saved me a lot of time and stress. I recommend it to anyone who has just moved or wants to feel more confident in Switzerland.'},
    {p:'Personal coaching sessions', t:'I came to the session because I’m planning to train as a psychotechnologist, and decided to try being the client. To say that one session turned me upside down is an understatement. I was ready for something to come up, but not for it to happen in an area of my life where I thought everything was fine. That’s your fine craftsmanship — finding what really needs attention. Working with my feelings was very gentle and caring, and piece by piece a lot of self-acceptance appeared. Now I’m not afraid to do the inner work, or to go and study. Huge thanks to you!'},
    {p:'Personal coaching sessions', t:'It works because it’s a very precise process, and the way it’s built brings results even with the most tangled and tight things. And you are the one leading it. You’re a lighthouse that shines. What kind of person you must be for people to trust you with things they tell no one. It wasn’t a waste of time at all. I’m happy.'},
    {p:'Personal coaching sessions', t:'Thank you for our work. Your caring approach really resonates with me, and so does the fact that we work not only through talking but also through the body. I feel the result right after a session — things get lighter, as if the inner tension goes away, and there’s more calm and clarity. And then the changes start showing up in my life too. I choose myself more often, see my automatic reactions more clearly and fall into old patterns less. Now it matters more to me to stay myself and trust myself. Thank you for your support and a safe space.'},
    {p:'Personal coaching sessions', t:'I want to express my deepest gratitude for your patience, attentiveness, gentleness and humanity. And above all for your professionalism in untangling my almost detective-like story. Thanks to your approach, I was able to unravel the whole tangle of memories, find the connections between them and understand many meanings that now help me with other questions too. And special thanks for helping me organise it all, step by step, into a separate file. That helps a lot too.'},
    {p:'The Swiss Guide bot', h:'https://t.me/swisscompass_bot', t:'Thank you for making the bot free to use. It’s a real help when you need to quickly figure out what to do here in Switzerland and have no one to ask.'},
    {p:'“My goal — my path”', h:HOME + '#path', t:'Thank you for our long work together. It turned my mindset upside down. I learned first-hand that when you change your thinking, your life changes too.'},
    {p:'“My goal — my path”', h:HOME + '#path', t:'I’ve managed to start building my own business. Small for now, but it’s already mine, and I’m moving forward.'}
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
      var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = 'Read in full'; q.insertAdjacentElement('afterend', b);
      b.addEventListener('click', function(){ var o = c.classList.toggle('open'); b.textContent = o ? 'Show less' : 'Read in full'; }); });
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
  document.querySelectorAll('.reviews-slot').forEach(function(slot, n){
    var id = 'rvs' + n;
    slot.innerHTML = '<section class="rvs" aria-labelledby="' + id + 'h"><div class="eyebrow">Client feedback</div><h2 id="' + id + 'h">What clients say</h2>'
      + '<p class="rvs-lead">Clients’ words from messages, from Instagram and from conversations after our sessions.</p>'
      + '<div class="rvs-track" id="' + id + '" tabindex="0" aria-label="Reviews, scroll sideways">'
      + R.map(function(r){ return '<figure class="rvs-card">' + (r.h ? '<a class="rvs-p" href="' + r.h + '" target="_blank" rel="noopener">' + esc(r.p) + '</a>' : '<span class="rvs-p">' + esc(r.p) + '</span>') + '<blockquote>' + esc(r.t) + '</blockquote><figcaption>A client’s words</figcaption></figure>'; }).join('')
      + '<figure class="rvs-card rvs-cta"><blockquote>Have you had a session with me too, or used the bot or a test? It would mean a lot to me to hear what has changed.</blockquote><a class="rvs-btn" href="' + TG + '" target="_blank" rel="noopener">Leave feedback</a><figcaption>Send me the word <span class="rvs-cw">ОТЗЫВ</span> on Telegram</figcaption></figure>'
      + '</div><div class="rvs-nav"><button type="button" data-d="-1" aria-label="Previous review">←</button><button type="button" data-d="1" aria-label="Next review">→</button></div></section>';
    var t = slot.querySelector('.rvs-track');
    clampMore(t, '.rvs-card', 'rvs-more');
    slot.querySelectorAll('[data-d]').forEach(function(b){ b.addEventListener('click', function(){ var c = t.querySelector('.rvs-card'); t.scrollBy({ left: (+b.dataset.d) * ((c ? c.offsetWidth : 300) + 14), behavior: 'smooth' }); }); });
  });
})();
