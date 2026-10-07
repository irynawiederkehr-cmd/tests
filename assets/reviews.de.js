/* Отзывы клиенток, листаются вбок. Только коучинговые отзывы (терапевтические — только в психологии).
   Разметка на странице: <div class="reviews-slot"></div> — блок появится на её месте.
   Главная страница рисует отзывы сама (там плашки открывают окна продуктов); тексты держать одинаковыми. */
(function(){
  var TG = 'https://t.me/IrynaNeuroCoach', HOME = 'https://voznesenskaya.ch/de/';
  var R = [
    {p:'Coaching-Sitzungen · eigenes Ziel', h:HOME + '#path', t:'Auch eine Wegbegleiterin braucht eine Wegbegleiterin. Danke für die Coaching-Sitzungen, die mir Zuversicht und den Glauben an mein Ziel gegeben haben — und vor allem habe ich angefangen zu handeln und mich auf den Weg dorthin zu machen.'},
    {p:'«Mein Fundament»', h:HOME + '#path', t:'Die Erkenntnis, dass meine Entscheidungen und das, was ich mir selbst erlaube, an meinen Werten hängen, hat meine Welt auf den Kopf gestellt. Seit unserer gemeinsamen Forschungsarbeit sind zwei Monate vergangen, und ich kann mir immer noch nicht vorstellen, wie ich ohne sie gelebt habe. Einfache Fragen, die genau ins Schwarze treffen, Verständnis, Annahme und Wärme in den Worten — und voilà, das Ergebnis. Die Arbeit mit Ihnen ist wie die Arbeit eines Juweliers, der einen Diamanten schleift. Sie haben es nicht eilig und tragen Schritt für Schritt, Frage für Frage, Schicht um Schicht die steinerne Rüstung ab, damit das wahre Wesen sichtbar wird. Mit Ihnen bin ich zur Welt gekommen.'},
    {p:'«Mein Fundament»', h:HOME + '#path', t:'Ich bin dir sehr dankbar für unsere Arbeit mit den Werten. Zweieinhalb Monate sind schon vergangen, und ich spüre immer noch, wie tief und wichtig sie für mich war. Ich konnte neu sehen, was mir wirklich wichtig ist und wofür ich meine Zeit, meine Kraft und meine Aufmerksamkeit geben möchte. Nach und nach sind diese Werte zu meinem Halt im Alltag geworden. Besonders spüre ich das, wenn ich vor einer schwierigen Entscheidung stehe. Jetzt kann ich innehalten und mich fragen: ‹Was ist mir gerade am wichtigsten? Welche Entscheidung ist im Einklang mit mir?› Und die Wahl fällt leichter. Es entsteht mehr Klarheit und mehr Vertrauen in mich selbst. Danke dir für die Tiefe, die Behutsamkeit und dafür, dass du mir geholfen hast, diesen Halt in mir selbst zu finden.'},
    {p:'Bot «Swiss Guide»', h:'https://t.me/swisscompass_bot', t:'Ein toller Bot, um in der Schweiz anzukommen! Er hilft sehr, die lokalen Feinheiten zu verstehen — von Alltagsfragen bis zur offiziellen Korrespondenz. Ich habe die Tipps zum Schreiben eines Briefes genutzt, alles nach den Ratschlägen des Bots gemacht und ein positives Ergebnis bekommen. Das hat mir viel Zeit und Nerven gespart. Ich empfehle ihn allen, die gerade umgezogen sind oder sich in der Schweiz sicherer fühlen möchten.'},
    {p:'Persönliche Coaching-Sitzungen', t:'Ich bin zur Sitzung gekommen, weil ich eine Ausbildung zur Psychotechnologin machen will, und habe beschlossen, mich einmal in der Rolle der Klientin auszuprobieren. Zu sagen, dass mich eine einzige Sitzung völlig auf den Kopf gestellt hat, ist untertrieben. Ich war darauf gefasst, dass etwas zum Vorschein kommt, aber nicht darauf, dass es in einem Lebensbereich passiert, in dem ich dachte, alles sei in Ordnung. Das ist deine feine Meisterschaft — zu erkennen, was wirklich Aufmerksamkeit braucht. Die Arbeit mit meinen Gefühlen war sehr sanft und behutsam, Stück für Stück ist viel Selbstannahme entstanden. Jetzt habe ich keine Angst mehr, an mir zu arbeiten, und auch nicht davor, die Ausbildung zu beginnen. Ganz herzlichen Dank dir!'},
    {p:'Persönliche Coaching-Sitzungen', t:'Es wirkt, weil es ein sehr präziser Prozess ist, und die Art, wie er aufgebaut ist, bringt Ergebnisse selbst bei den verworrensten und verkrampftesten Dingen. Und du bist die, die führt. Du bist ein Leuchtturm, der leuchtet. Was für ein Mensch muss man sein, damit dir jemand anvertraut, was man sonst niemandem erzählt. Ich habe meine Zeit überhaupt nicht verschwendet. Ich bin zufrieden.'},
    {p:'Persönliche Coaching-Sitzungen', t:'Danke dir für unsere Arbeit. Dein behutsamer Ansatz spricht mich sehr an, und auch, dass wir nicht nur über das Gespräch arbeiten, sondern auch über den Körper. Das Ergebnis spüre ich direkt nach der Sitzung — es wird leichter, als ob die innere Anspannung weggeht, es entsteht mehr Ruhe und Klarheit. Und dann zeigen sich die Veränderungen auch im Leben. Ich wähle öfter mich selbst, erkenne meine automatischen Reaktionen besser und rutsche seltener in gewohnte Muster. Jetzt ist es mir wichtiger, ich selbst zu bleiben und mir zu vertrauen. Danke dir für die Unterstützung und den sicheren Raum.'},
    {p:'Persönliche Coaching-Sitzungen', t:'Ich möchte dir meinen tiefsten Dank aussprechen für deine Geduld, Aufmerksamkeit, Sanftheit und Menschlichkeit. Und vor allem für deine Professionalität beim Entwirren meiner fast schon detektivischen Geschichte. Dank deines Ansatzes konnte ich das ganze Knäuel an Erinnerungen aufrollen, die Zusammenhänge zwischen ihnen finden und viele Bedeutungen verstehen, die mir jetzt auch bei anderen Fragen helfen. Und ein besonderer Dank dafür, dass du mir geholfen hast, all das Schritt für Schritt in einer eigenen Datei zu ordnen. Auch das hilft sehr.'},
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
      var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = 'Ganz lesen'; q.insertAdjacentElement('afterend', b);
      b.addEventListener('click', function(){ var o = c.classList.toggle('open'); b.textContent = o ? 'Einklappen' : 'Ganz lesen'; }); });
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
  document.querySelectorAll('.reviews-slot').forEach(function(slot, n){
    var id = 'rvs' + n;
    slot.innerHTML = '<section class="rvs" aria-labelledby="' + id + 'h"><div class="eyebrow">Stimmen von Klientinnen</div><h2 id="' + id + 'h">Was Klientinnen sagen</h2>'
      + '<p class="rvs-lead">Worte von Klientinnen aus Nachrichten, aus Instagram und aus persönlichen Gesprächen nach den Sitzungen.</p>'
      + '<div class="rvs-track" id="' + id + '" tabindex="0" aria-label="Stimmen, seitlich blättern">'
      + R.map(function(r){ return '<figure class="rvs-card">' + (r.h ? '<a class="rvs-p" href="' + r.h + '" target="_blank" rel="noopener">' + esc(r.p) + '</a>' : '<span class="rvs-p">' + esc(r.p) + '</span>') + '<blockquote>' + esc(r.t) + '</blockquote><figcaption>Stimme einer Klientin</figcaption></figure>'; }).join('')
      + '<figure class="rvs-card rvs-cta"><blockquote>Warst du auch bei mir in einer Sitzung oder hast den Bot oder einen Test genutzt? Es wäre mir sehr wertvoll zu hören, was sich verändert hat.</blockquote><a class="rvs-btn" href="' + TG + '" target="_blank" rel="noopener">Feedback geben</a><figcaption>Schreib mir in Telegram das Wort <span class="rvs-cw">ОТЗЫВ</span></figcaption></figure>'
      + '</div><div class="rvs-nav"><button type="button" data-d="-1" aria-label="Vorherige Stimme">←</button><button type="button" data-d="1" aria-label="Nächste Stimme">→</button></div></section>';
    var t = slot.querySelector('.rvs-track');
    clampMore(t, '.rvs-card', 'rvs-more');
    slot.querySelectorAll('[data-d]').forEach(function(b){ b.addEventListener('click', function(){ var c = t.querySelector('.rvs-card'); t.scrollBy({ left: (+b.dataset.d) * ((c ? c.offsetWidth : 300) + 14), behavior: 'smooth' }); }); });
  });
})();
