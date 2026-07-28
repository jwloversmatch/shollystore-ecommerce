/// <reference lib="WebWorker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// Define missing types
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

interface SyncEventLike {
  tag: string;
  waitUntil(promise: Promise<void>): void;
}

// Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Immediately claim clients
self.skipWaiting();
clientsClaim();

// ── Image Caching ──────────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// ── Font Caching ───────────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// ── Static Assets (JS, CSS) ────────────────────────────────────────────────
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// ── API Caching ────────────────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// ── Offline Fallback ───────────────────────────────────────────────────────
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  })
);

// ── Push Event Handler ─────────────────────────────────────────────────────
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

    pushEvent.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);

    pushEvent.waitUntil(
      self.registration.showNotification('ShollyStore', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
      })
    );
  }
});

// ── Notification Click Handler ────────────────────────────────────────────
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

// ── Background Sync ────────────────────────────────────────────────────────
self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as unknown as SyncEventLike;
  if (syncEvent.tag === 'sync-messages') {
    syncEvent.waitUntil(Promise.resolve());
  }
});

// ── Message Handler ───────────────────────────────────────────────────────
self.addEventListener('message', (event: Event) => {
  const msgEvent = event as ExtendableMessageEvent;
  if (msgEvent.data && msgEvent.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

export {};