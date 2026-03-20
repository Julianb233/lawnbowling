// Self-destructing service worker — clears all caches and unregisters itself.
// The Serwist PWA service worker was disabled due to aggressive HTML caching
// that caused routes to misdirect to wrong pages. This script ensures any
// previously-registered SW cleans up after itself.

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (names) {
        return Promise.all(names.map(function (name) { return caches.delete(name); }));
      })
      .then(function () {
        return self.registration.unregister();
      })
      .then(function () {
        return self.clients.matchAll();
      })
      .then(function (clients) {
        clients.forEach(function (client) { client.navigate(client.url); });
      })
  );
});
