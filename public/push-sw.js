// Push notification service worker for Pick a Partner
// This runs independently of the Serwist PWA service worker

self.addEventListener("push", function (event) {
  if (!event.data) return;

  var payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "Pick a Partner", body: event.data.text() };
  }

  var options = {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/icon-72.png",
    tag: payload.tag || "pap-notification",
    data: { url: payload.url || "/" },
    actions: payload.actions || [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var url = (event.notification.data && event.notification.data.url) || "/";
  var action = event.action;

  if (action === "dismiss") return;

  var targetUrl = url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (
            client.url.indexOf(self.location.origin) !== -1 &&
            "focus" in client
          ) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});
