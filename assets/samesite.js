/* Свои страницы открываются в той же вкладке: voznesenskaya.ch и svoiludi.ch.
   Внешние ссылки (Telegram, Instagram, бот, реестры) по-прежнему открываются в новой вкладке. */
(function(){
  var own = /^(www\.)?(voznesenskaya\.ch|svoiludi\.ch|localhost|127\.0\.0\.1)$/;
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[target="_blank"]') : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#' || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (!/^https?:$/.test(u.protocol) || !(u.origin === location.origin || own.test(u.hostname))) return;
    e.preventDefault(); location.href = u.href;
  }, true);
})();
