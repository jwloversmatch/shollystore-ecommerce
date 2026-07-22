/// <reference lib="WebWorker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);
clientsClaim();

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' })
);

// Push event listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const { title, body, icon, image, data } = payload;

  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    // The `image` property is not in the TS types for NotificationOptions,
    // but it is supported by modern browsers – so we cast it.
    image: image || '/og-default.jpg',
    data: data || {},
    vibrate: [200, 100, 200],
  } as NotificationOptions;

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    (self.clients as Clients).openWindow(urlToOpen)
  );
});