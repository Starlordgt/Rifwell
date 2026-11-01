// Riffwell çevrimdışı önbellek. Güncellemede SURUM'ü bir artır.
// Sayfa önce internetten alınır (güncellemeler hemen gelir), internet yoksa önbellekten açılır.
const SURUM = 'riffwell-v24';
const DOSYALAR = ['./', 'index.html', 'manifest.webmanifest', 'riffwell-dark-192.png', 'riffwell-dark-512.png', 'riffwell-dark-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM)
    .then(c => c.addAll(DOSYALAR.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const sayfa = req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (sayfa) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const kopya = res.clone(); caches.open(SURUM).then(c => c.put('index.html', kopya)); }
      return res;
    }).catch(() => caches.match('index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const kopya = res.clone(); caches.open(SURUM).then(c => c.put(req, kopya)); }
    return res;
  })));
});
