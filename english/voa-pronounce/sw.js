/* 应用外壳缓存：只缓存同源的 html/js/图标，视频等外链一律走网络 */
var CACHE = "voa-shell-v1";
var SHELL = [
    "./",
    "./index.html",
    "./playlist.js",
    "./manifest.webmanifest",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE)
            .then(function (c) { return c.addAll(SHELL); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener("activate", function (e) {
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

self.addEventListener("fetch", function (e) {
    var req = e.request;
    if (req.method !== "GET") return;

    var url = new URL(req.url);
    if (url.origin !== self.location.origin) return;   // 视频 CDN 不介入

    // 网络优先：保证 playlist.js 重新抓取后立即生效，断网时回退缓存
    e.respondWith(
        fetch(req)
            .then(function (res) {
                if (res && res.ok) {
                    var copy = res.clone();
                    caches.open(CACHE).then(function (c) { c.put(req, copy); });
                }
                return res;
            })
            .catch(function () {
                return caches.match(req).then(function (hit) {
                    return hit || caches.match("./index.html");
                });
            })
    );
});
