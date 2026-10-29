// Riffwell çevrimdışı önbellek. index.html'i güncellediğinde SURUM'ü artır (riffwell-v2 gibi).
const SURUM = 'riffwell-v5';
const DOSYALAR = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const kopya = res.clone(); caches.open(SURUM).then(c => c.put(req, kopya)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
