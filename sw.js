/* Service worker for the IPO Management Portal.
   Network-first for the page itself (so updates always arrive), falls back to the
   cached copy when offline. Google Drive / API calls are never cached. */
const CACHE = 'ipo-portal-v1';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/googleapis\.com|google\.com|gstatic\.com/.test(url.hostname) && !/fonts\./.test(url.hostname)) return;
  e.respondWith(fetch(req).then(res => { if (res && res.ok && (url.origin === location.origin || /cdnjs|jsdelivr|fonts\./.test(url.hostname))) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
