// ---- Service worker: app-shell caching for offline/PWA support ----
// Network-first, cache as fallback — so an update to any file shows up
// immediately whenever you're online, and you only ever see a cached
// (possibly stale) copy when there's genuinely no connection. Supabase
// requests are explicitly never touched here; that's live data, not
// something a static-asset cache should ever get in the way of.

const CACHE_NAME = "seiza-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/progress.js",
  "./js/db.js",
  "./js/storage.js",
  "./js/library.js",
  "./js/achievements.js",
  "./js/graph.js",
  "./js/panel.js",
  "./js/toast.js",
  "./js/app.js",
  "./manifest.json",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("supabase.co")) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
