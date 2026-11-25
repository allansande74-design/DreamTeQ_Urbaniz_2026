const CACHE_NAME = "urbaniz-shell-v3";
const APP_SHELL = ["/", "/manifest.json", "/icon.svg"];

function cacheResponse(event, request, response) {
  if (!response.ok) return;
  const copy = response.clone();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.put(request, copy))
      .catch(() => undefined)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).then((response) => {
        if (url.pathname === "/api/spots") cacheResponse(event, request, response);
        return response;
      }).catch(async () => (await caches.match(request)) || Response.error())
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        cacheResponse(event, "/", response);
        return response;
      }).catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error())
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        cacheResponse(event, request, response);
        return response;
      }))
    );
  }
});
