/* «Свои люди» одной кнопкой — отдельное окошко со ссылками (КОПИЯ 15.10.2026).
   Ирина, 15.10.2026: «там, где у нас путь клиента и все продукты, тоже «Свои люди» одной кнопкой, и при открытии отдельное окошко
   со ссылками: что человек может сделать сам, что почитать, какие инструменты могут пригодиться. Чтобы не размазывать внимание клиента».
   Одно окошко на всём сайте: главная (программы «По ступеням» и «По шагам»), «Твой путь», «Своё дело», «Отношения».
   SvoiOkno.button(items, title[, note]) — HTML кнопки; items: { h, t, d } (ссылка на svoiludi.ch) или { p, t, d } (окно программы на главной).
   Ссылки раскладываются сами по адресу: situacii — «Что сделать по шагам», shveycariya — «Что почитать», instrumenty и бот — «Инструменты»,
   события, курсы, организации, справочник — «Где найти своих». */
(function () {
  if (window.SvoiOkno) return;
  var REG = [], dlg = null;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  /* значок «Свои люди» — та же шалфейная веточка, что у вида помощи «Свои люди» на главной (LVSVG.sl), в кольце, как значки трёх видов помощи (13.10.2026) */
  var SL = '<path class="st" d="M11.2 21.8c.2-5.6.5-11.2.8-16.6"/><path class="fs" d="M11.4 17.6C10.6 14.6 8 12.9 4.6 13c.9 3.3 3.6 5 6.8 4.6z"/><path class="fs" d="M11.5 17.6c.9-3 3.6-4.6 6.9-4.4-1 3.2-3.8 4.8-6.9 4.4z"/><path class="fs" d="M11.7 12.2c-.7-2.6-2.9-4.1-5.8-4.1.8 2.9 3.1 4.4 5.8 4.1z"/><path class="fs" d="M11.8 12.2c.8-2.6 3.1-4 5.9-3.8-.9 2.8-3.2 4.2-5.9 3.8z"/><path class="fs" d="M12 7.2c-1.6-1.4-1.8-3.5-.2-5.1 1.7 1.5 1.8 3.6.2 5.1z"/>';
  var sprig = function (sz) { return '<svg class="svoi-lvi" viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" style="--sw:' + Math.min(1.8, Math.max(0.9, 38 / sz)).toFixed(2) + '" aria-hidden="true">' + SL + '</svg>'; };
  var GROUPS = [
    ['do', 'Что сделать по шагам', /\/situacii\//],
    ['read', 'Что почитать', /\/shveycariya\/|\/dlya-specialistov\//],
    ['tool', 'Инструменты', /\/instrumenty\/|t\.me\/swisscompass/],
    ['people', 'Встречи, люди и справочник', /\/(events|kursy|organizacii|join|vakansii|akcii)\/|svoiludi\.ch\/(uk\/)?(#.*)?$/]
  ];
  function group(it) {
    if (!it.h) return it.g || 'tool';
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i][2].test(it.h)) return GROUPS[i][0];
    return 'read';
  }
  var CSS = '.svoi-btn{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font:inherit;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-left:5px solid var(--c);border-radius:14px;padding:11px 14px;cursor:pointer;transition:border-color .15s}'
    + '.svoi-btn,.svoi-dlg{--c:#5E6B45;--f:#E3E8D3;--ci:#5E8A6C}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .svoi-btn,:root:not([data-theme="light"]) .svoi-dlg{--c:#B4BF97;--f:#2E3226;--ci:#B4BF97}}:root[data-theme="dark"] .svoi-btn,:root[data-theme="dark"] .svoi-dlg{--c:#B4BF97;--f:#2E3226;--ci:#B4BF97}.svoi-btn:hover{border-color:var(--c)}.svoi-ic{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--paper);border:1.5px solid var(--ci);box-shadow:0 4px 10px -6px color-mix(in srgb,var(--ci) 60%,transparent)}.svoi-lvi{flex:none;display:block}.svoi-lvi .fs{fill:var(--f);stroke:var(--ci);stroke-width:var(--sw,1.6);stroke-linejoin:round}.svoi-lvi .st{fill:none;stroke:var(--ci);stroke-width:var(--sw,1.6);stroke-linecap:round;stroke-linejoin:round}'
    + '.svoi-t{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}.svoi-t b{font-size:.96rem;line-height:1.3}.svoi-t small{font-size:.82rem;color:var(--muted);line-height:1.35}'
    + '.svoi-n{flex:none;font-weight:700;font-size:.8rem;color:var(--c);border:1.5px solid color-mix(in srgb,var(--c) 45%,transparent);border-radius:999px;padding:2px 9px}'
    + '.svoi-go{flex:none;font-weight:700;color:var(--c)}'
    + '.svoi-dlg{border:0;padding:0;background:transparent;width:min(100% - 24px,580px);max-height:88vh;color:var(--ink)}.svoi-dlg::backdrop{background:rgba(47,41,36,.45)}'
    + '.svoi-card{background:var(--paper);border-radius:22px;padding:clamp(18px,3vw,28px);max-height:88vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px;box-shadow:0 30px 80px -30px rgba(40,25,10,.6)}'
    + '.svoi-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.svoi-top h3{font-family:var(--display);font-weight:400;font-size:1.4rem;line-height:1.2;margin:4px 0 0}'
    + '.svoi-eb{display:flex;align-items:center;gap:6px;font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--c)}'
    + '.svoi-x{flex:none;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--paper);color:var(--ink);font-size:1rem;cursor:pointer}'
    + '.svoi-lead{color:var(--muted);font-size:.9rem;margin:0}.svoi-g h4{font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:6px 0 6px;font-weight:700}'
    + '.svoi-list{display:flex;flex-direction:column;gap:8px}'
    + '.svoi-list a,.svoi-list button{display:flex;flex-direction:column;gap:2px;text-align:left;font:inherit;width:100%;background:var(--paper);border:1px solid var(--line);border-left:4px solid var(--c);border-radius:12px;padding:10px 12px;text-decoration:none;color:var(--ink);cursor:pointer}'
    + '.svoi-list a:hover,.svoi-list button:hover{border-color:var(--c)}.svoi-list b{font-size:.94rem;line-height:1.3}.svoi-list span{font-size:.85rem;color:var(--muted)}'
    + '.svoi-foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center;border-top:1px dashed var(--line);padding-top:10px;margin-top:2px}'
    + '.svoi-back{font:700 .88rem/1 var(--body,system-ui);color:var(--brown);background:none;border:0;padding:6px 0;cursor:pointer}.svoi-foot a{font-size:.84rem;color:var(--muted)}';
  function css() { if (document.getElementById('svoi-css')) return; var s = document.createElement('style'); s.id = 'svoi-css'; s.textContent = CSS; document.head.appendChild(s); }
  function close() { if (dlg && dlg.open) { typeof dlg.close === 'function' ? dlg.close() : dlg.removeAttribute('open'); } }
  function open(i) {
    var r = REG[i]; if (!r) return; css();
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'svoi-dlg'; dlg.setAttribute('aria-labelledby', 'svoiT');
      dlg.innerHTML = '<div class="svoi-card" id="svoiCard"></div>'; document.body.appendChild(dlg);
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg || e.target.closest('[data-svoi-x]')) return close();
        var p = e.target.closest('[data-svoi-p]'); if (p) { close(); if (window.vzOpenProgram) window.vzOpenProgram(p.getAttribute('data-svoi-p')); }
      });
    }
    var by = {}; r.items.forEach(function (it) { var g = group(it); (by[g] = by[g] || []).push(it); });
    var lang = document.documentElement.lang === 'uk' ? 'uk/' : '';
    document.getElementById('svoiCard').innerHTML = '<div class="svoi-top"><div><div class="svoi-eb">' + sprig(16) + 'Свои люди · бесплатно</div><h3 id="svoiT">' + esc(r.title) + '</h3></div>'
      + '<button type="button" class="svoi-x" data-svoi-x aria-label="Закрыть">✕</button></div>'
      + '<p class="svoi-lead">' + esc(r.note || 'Что ты можешь сделать сама: статьи и бесплатные инструменты на сайте моего проекта «Свои люди» — справочника и сообщества для всех, кто живёт в Швейцарии. Открываются в новой вкладке.') + '</p>'
      + GROUPS.map(function (g) {
        var a = by[g[0]]; if (!a || !a.length) return '';
        return '<div class="svoi-g"><h4>' + g[1] + '</h4><div class="svoi-list">' + a.map(function (it) {
          var inner = '<b>' + esc(it.t) + ' →</b>' + (it.d ? '<span>' + esc(it.d) + '</span>' : '');
          return it.h ? '<a href="' + esc(it.h) + '" target="_blank" rel="noopener">' + inner + '</a>' : '<button type="button" data-svoi-p="' + esc(it.p) + '">' + inner + '</button>';
        }).join('') + '</div></div>';
      }).join('')
      + '<div class="svoi-foot"><button type="button" class="svoi-back" data-svoi-x>← Вернуться</button><a href="https://svoiludi.ch/' + lang + '" target="_blank" rel="noopener">Открыть «Свои люди» целиком ↗</a></div>';
    if (typeof dlg.showModal === 'function') { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } } else dlg.setAttribute('open', '');
    document.getElementById('svoiCard').scrollTop = 0;
  }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-svoi]'); if (b) { e.preventDefault(); e.stopPropagation(); open(+b.getAttribute('data-svoi')); } }, true);
  window.SvoiOkno = {
    button: function (items, title, small) {
      css(); var seen = {}, list = (items || []).filter(function (it) { var k = it.h || it.p; if (!k || seen[k]) return false; seen[k] = 1; return true; });
      if (!list.length) return '';
      REG.push({ items: list, title: title }); var i = REG.length - 1;
      return '<button type="button" class="svoi-btn" data-svoi="' + i + '"><span class="svoi-ic">' + sprig(24) + '</span><span class="svoi-t"><b>Практическое · «Свои люди»</b><small>'
        + esc(small || 'что сделать самой, что почитать, какие инструменты пригодятся') + '</small></span><span class="svoi-n">' + list.length + '</span><span class="svoi-go" aria-hidden="true">→</span></button>';
    },
    open: open, close: close
  };
})();
