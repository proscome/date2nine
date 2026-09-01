const CACHE = 'date2nine-v3';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];


/* ==========================================
   インストール
   ========================================== */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});


/* ==========================================
   有効化
   古いキャッシュを削除
   ========================================== */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});


/* ==========================================
   ファイル取得
   基本はネットから最新版を取得
   オフラインの場合はキャッシュを使用
   ========================================== */
self.addEventListener('fetch', (e) => {

  const req = e.request;

  /* GET以外はそのまま */
  if (req.method !== 'GET') {
    return;
  }

  e.respondWith(

    fetch(req)
      .then((response) => {

        /* 正常なレスポンスならキャッシュも更新 */
        if (response && response.ok) {

          const copy = response.clone();

          caches.open(CACHE).then((cache) => {
            cache.put(req, copy);
          });

        }

        return response;
      })

      .catch(() => {

        /* オフラインならキャッシュを使用 */
        return caches.match(req);

      })

  );
});
