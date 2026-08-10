// ---- Service worker: app-shell caching for offline/PWA support ----
// Network-first, cache as fallback — so an update to any file shows up
// immediately whenever you're online, and you only ever see a cached
// (possibly stale) copy when there's genuinely no connection. Supabase
// requests are explicitly never touched here; that's live data, not
// something a static-asset cache should ever get in the way of.

// Keep this in sync with APP_VERSION in js/version.js — bumping it
// here is what actually forces stale caches to clear on old devices.
const CACHE_NAME = "seiza-v1.0.6";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/version.js",
  "./js/tabBarHeight.js",
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

// ---- Push notifications (daily nudge) ----
// The actual send happens server-side (a scheduled GitHub Action) —
// this just displays whatever payload arrives, and focuses/opens the
// app on tap instead of leaving a dead notification.
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Seiza", {
      body: data.body || "Come learn something today.",
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
      data: { url: data.url || "./index.html" }
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./index.html";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
