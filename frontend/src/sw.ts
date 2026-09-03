/// <reference lib="WebWorker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  actions?: Array<{ action: string; title: string }>;
}

interface SyncEventLike {
  tag: string;
  waitUntil(promise: Promise<void>): void;
}

precacheAndRoute(self.__WB_MANIFEST);

const RUNTIME_CACHE_NAMES = ['images', 'fonts', 'static-resources', 'api-cache'];

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return !RUNTIME_CACHE_NAMES.includes(name) && !name.startsWith('workbox-precache');
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

clientsClaim();
// self.skipWaiting() is intentionally NOT called here anymore — the new
// worker now waits until the person accepts an update prompt (see the
// SKIP_WAITING message handler below) instead of force-reloading every
// open tab the instant a new build deploys.

const navigationHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [
    /^\/api\//,
    /^\/oauth\//,
  ],
});
registerRoute(navigationRoute);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 24 * 60 * 60, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Sensitive / user-specific — never cache. Registered BEFORE the generic
// /api/ rule below since Workbox uses first-match-wins.
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/orders/verify/') ||
    url.pathname.startsWith('/api/auth/') ||
    url.pathname === '/api/orders/my-orders',
  new NetworkOnly()
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

self.addEventListener('push', (event: Event) => {
  const pushEvent = event as PushEvent;
  if (!pushEvent.data) return;

  try {
    const payload = pushEvent.data.json();
    const { title, body, icon, badge, data, tag } = payload;

    const options: ExtendedNotificationOptions = {
      body: body || 'You have a new notification',
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-72x72.png',
      data: data || {},
      tag: tag || 'default',
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    pushEvent.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('[SW] Push notification error:', error);
    pushEvent.waitUntil(
      self.registration.showNotification('Sholex', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event: Event) => {
  const notifEvent = event as NotificationEvent;
  notifEvent.notification.close();

  if (notifEvent.action === 'dismiss') return;

  const urlToOpen = notifEvent.notification.data?.url || '/';

  notifEvent.waitUntil(
    (self.clients as Clients)
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients: readonly WindowClient[]) => {
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return (client as WindowClient).focus();
          }
        }
        return (self.clients as Clients).openWindow(urlToOpen);
      })
  );
});

self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as unknown as SyncEventLike;
  if (syncEvent.tag === 'sync-messages') {
    syncEvent.waitUntil(Promise.resolve());
  }
});

self.addEventListener('message', (event: Event) => {
  const msgEvent = event as ExtendableMessageEvent;

  if (msgEvent.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (msgEvent.data?.type === 'CLEAR_API_CACHE') {
    msgEvent.waitUntil(caches.delete('api-cache'));
  }
});

export {};