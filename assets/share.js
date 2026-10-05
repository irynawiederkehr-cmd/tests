/* «Поделиться с друзьями»: готовое сообщение другу и ссылка с красивым превью.
   Разметка на странице: <div class="share-slot" data-text="Сообщение" data-url="https://…" data-lead="Подпись над кнопкой"></div>
   На телефоне открывается системное окно «Поделиться», на компьютере — сообщение с кнопками. */
(function(){
  var css = '.share-slot{margin:40px 0 8px}'
  + '.shr{background:var(--paper,#FFFCF8);border:1.5px solid var(--line,#E5D9C9);border-radius:22px;padding:20px 22px;display:flex;flex-direction:column;gap:12px}'
  + '.shr-top{display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between}'
  + '.shr-top p{margin:0;max-width:56ch;font-family:var(--display,"Forum",Georgia,serif);font-size:1.25rem;line-height:1.35;color:var(--ink,#2F2924)}'
  + '@keyframes shrShine{0%{background-position:130% 0}60%,100%{background-position:-30% 0}}'
  + '.shr-btn{font:inherit;font-family:var(--body,"Manrope",system-ui,sans-serif);font-weight:700;font-size:.92rem;border:0;border-radius:999px;padding:12px 20px;cursor:pointer;color:#fff;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(110deg,#4F5E3E 38%,#9DB07A 50%,#4F5E3E 62%);background-size:260% 100%;animation:none;box-shadow:0 8px 18px -8px rgba(79,94,62,.6)}'
  + '.shr-btn.brown{background:linear-gradient(110deg,#6E4F3C 38%,#C9A27E 50%,#6E4F3C 62%);background-size:260% 100%;box-shadow:0 8px 18px -8px rgba(110,79,60,.6)}'
  + '.shr-btn.ghost{animation:none;background:transparent;color:var(--brown,#6E4F3C);border:1.5px solid var(--line,#E5D9C9);box-shadow:none}'
  + '@media (prefers-reduced-motion: reduce){.shr-btn{animation:none}}'
  + '.shr textarea{font:inherit;font-family:var(--body,"Manrope",system-ui,sans-serif);font-size:.95rem;line-height:1.5;color:var(--ink,#2F2924);background:var(--bg,#F4EDE3);border:1.5px solid var(--line,#E5D9C9);border-radius:14px;padding:12px 14px;min-height:120px;resize:vertical;width:100%;box-sizing:border-box}'
  + '.shr-row{display:flex;flex-wrap:wrap;gap:8px}'
  + '.shr-note{margin:0;font-size:.82rem;color:var(--muted,#7A6E62)}'
  + '@media (max-width:640px){.shr{padding:16px}.shr textarea{min-height:190px}.shr-top p{font-size:1.12rem}.shr-top .shr-btn{width:100%}.shr-row .shr-btn{flex:1 1 100%;padding:11px 8px;text-align:center}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function enc(s){ return encodeURIComponent(s); }
  document.querySelectorAll('.share-slot').forEach(function(slot, n){
    var url = slot.getAttribute('data-url') || location.href.split('#')[0];
    var text = slot.getAttribute('data-text') || '';
    var lead = slot.getAttribute('data-lead') || 'Знаешь кого-то, кому это сейчас нужно? Перешли страницу, сообщение уже готово.';
    var id = 'shr' + n;
    slot.innerHTML = '<div class="shr"><div class="shr-top"><p>' + lead + '</p>'
      + '<button class="shr-btn" type="button" aria-expanded="false" aria-controls="' + id + '">Поделиться с друзьями</button></div>'
      + '<div id="' + id + '" hidden style="display:flex;flex-direction:column;gap:10px">'
      + '<label for="' + id + 't" class="shr-note">Сообщение можно поправить под себя</label>'
      + '<textarea id="' + id + 't"></textarea>'
      + '<div class="shr-row"><button class="shr-btn" type="button" data-a="copy">Скопировать сообщение</button>'
      + '<a class="shr-btn brown" data-a="tg" target="_blank" rel="noopener">Отправить в Telegram</a>'
      + '<a class="shr-btn brown" data-a="wa" target="_blank" rel="noopener">Отправить в WhatsApp</a></div>'
      + '<p class="shr-note" role="status" data-a="msg"></p></div></div>';
    var panel = slot.querySelector('#' + id), ta = slot.querySelector('textarea'), msg = slot.querySelector('[data-a=msg]');
    var main = slot.querySelector('.shr-top .shr-btn'), tg = slot.querySelector('[data-a=tg]'), wa = slot.querySelector('[data-a=wa]');
    ta.value = text + '\n' + url;
    function links(){ var t = ta.value; tg.href = 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(t.replace(url, '').trim()); wa.href = 'https://wa.me/?text=' + enc(t); }
    links(); ta.addEventListener('input', links);
    var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
    main.addEventListener('click', function(){
      if (touch && navigator.share){ navigator.share({text: text, url: url}).catch(function(){}); return; }
      panel.hidden = !panel.hidden; panel.style.display = panel.hidden ? 'none' : 'flex'; main.setAttribute('aria-expanded', String(!panel.hidden));
    });
    panel.style.display = 'none';
    slot.querySelector('[data-a=copy]').addEventListener('click', function(){
      var done = function(){ msg.textContent = 'Сообщение скопировано. Вставь его в чат другу.'; };
      var fb = function(){ ta.select(); try { document.execCommand('copy'); done(); } catch(e){ msg.textContent = 'Выдели текст и скопируй его.'; } };
      try { navigator.clipboard.writeText(ta.value).then(done, fb); } catch(e){ fb(); }
    });
  });
})();
