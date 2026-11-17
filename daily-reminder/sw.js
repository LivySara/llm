/* 应用外壳缓存：同源静态资源缓存优先，实现离线打开 */
var CACHE = 'daily-reminder-v3';
var SHELL = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './apple-touch-icon.png',
    './daily-reminder.ics'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE)
            .then(function (c) {
                return Promise.all(SHELL.map(function (url) {
                    return c.add(url).catch(function () {});
                }));
            })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys()
            .then(function (keys) {
                return Promise.all(keys.map(function (k) {
                    if (k !== CACHE) return caches.delete(k);
                }));
            })
            .then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;

    var url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    // 缓存优先 + 后台更新：断网也能打开，联网时静默刷新
    e.respondWith(
        caches.match(req).then(function (hit) {
            var network = fetch(req)
                .then(function (res) {
                    if (res && res.ok) {
                        var copy = res.clone();
                        caches.open(CACHE).then(function (c) { c.put(req, copy); });
                    }
                    return res;
                })
                .catch(function () { return hit; });
            return hit || network;
        })
    );
});
