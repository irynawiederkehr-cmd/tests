/* Правовые страницы: адрес и e-mail берутся из config.js (LEGAL). Пока они не заданы — показывается временная строка. */
(function(){
  const L = (typeof LEGAL !== 'undefined') ? LEGAL : {};
  const lang = (typeof PAGE_LANG !== 'undefined' && PAGE_LANG) || document.documentElement.lang || 'ru';
  const pick = v => (v && typeof v === 'object') ? (v[lang] || v.ru || '') : (v || '');
  const has = !!pick(L.address), hasMail = !!L.email;
  document.querySelectorAll('[data-legal]').forEach(e => {
    const k = e.dataset.legal, v = pick(L[k]);
    if (k === 'email' && v) e.innerHTML = `<a href="mailto:${v}">${v}</a>`;
    else if (k === 'address' && v) e.innerHTML = v.split('\n').join('<br>');
    else e.textContent = v;
  });
  document.querySelectorAll('[data-legal-has]').forEach(e => e.hidden = !has);
  document.querySelectorAll('[data-legal-missing]').forEach(e => e.hidden = hasMail);
  document.querySelectorAll('[data-legal-mail]').forEach(e => e.hidden = !hasMail);
  document.querySelectorAll('[data-legal-since]').forEach(e => e.textContent = L.since || '');
  document.querySelectorAll('[data-legal-year]').forEach(e => e.textContent = new Date().getFullYear());
  document.querySelectorAll('[data-legal-days]').forEach(e => e.textContent = (typeof DATA_DAYS !== 'undefined') ? DATA_DAYS : 90);
  const back = document.querySelector('[data-legal-back]'); if (back) back.href = (typeof SITE_BASE !== 'undefined' ? SITE_BASE : '../') + 'testy/';
})();
