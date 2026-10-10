/* voznesenskaya.ch как приложение (08.10.2026).
   Страницы: сначала сеть, без сети — сохранённая копия, иначе offline.html.
   Файлы (стили, скрипты, шрифты, картинки): сразу из памяти, в фоне обновляются.
   Личные записи людей здесь не хранятся: они остаются в localStorage браузера, как раньше.
   При изменении этого файла поднять VERSION — старая память удалится. */
const VERSION = 'v10-2026-10-10';
const CACHE = 'vz-' + VERSION;
const CORE = ['/offline.html', '/assets/vz-app.js', '/icon-192.png', '/favicon.svg'];
const MAX = 160;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('vz-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function trim(){
  const c = await caches.open(CACHE); const keys = await c.keys();
  for (let i = 0; i < keys.length - MAX; i++) await c.delete(keys[i]);
}
async function put(req, res){
  if (!res || !res.ok || res.type === 'opaque') return;
  const c = await caches.open(CACHE); await c.put(req, res); trim();
}
function timeout(ms){ return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)); }

async function page(req){
  const key = new Request(new URL(req.url).pathname);          // одна копия на страницу, без ?параметров
  try {
    const res = await Promise.race([fetch(req), timeout(6000)]);
    put(key, res.clone());
    return res;
  } catch (e) {
    return (await caches.match(key)) || (await caches.match('/offline.html')) || Response.error();
  }
}
async function file(req, ev){
  const hit = await caches.match(req);
  const net = fetch(req).then(res => { put(req, res.clone()); return res; }).catch(() => null);
  if (hit){ ev.waitUntil(net); return hit; }
  return (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                  // формы, таблицы, внешние сервисы — мимо
  if (url.pathname === '/sw.js') return;
  if (req.mode === 'navigate') { e.respondWith(page(req)); return; }
  if (/\.(css|js|woff2?|ttf|png|jpe?g|svg|webp|ico|json|webmanifest)$/i.test(url.pathname)) e.respondWith(file(req, e));
});
