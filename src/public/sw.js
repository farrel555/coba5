import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

self.skipWaiting();
clientsClaim();

precacheAndRoute([
  { url: '/', revision: null },
  ...(self.__WB_MANIFEST || [])
]);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new CacheFirst({
    cacheName: 'html-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ request }) =>
    request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://your-api-domain.com',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new StaleWhileRevalidate({
    cacheName: 'dicoding-api-cache',
  })
);

// Push Notification Handler
self.addEventListener('push', event => {
  let data = {
    title: 'Pesan Baru',
    body: 'Anda punya cerita baru!',
    senderClientId: null,
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

      // Kirim pesan ke semua tab agar presenter/view bisa update data lewat BroadcastChannel
      clientList.forEach(client => {
        client.postMessage({
          type: 'NEW_STORY',
          title: data.title,
          body: data.body,
          senderClientId: data.senderClientId || null,
        });
      });

      // Tampilkan notifikasi hanya jika client penerima bukan pengirim
      return new Promise((resolve) => {
        let handled = false;
        const channel = new BroadcastChannel('push_channel');

        channel.addEventListener('message', (messageEvent) => {
          if (messageEvent.data?.type === 'CLIENT_ID') {
            const clientId = messageEvent.data.clientId;

            if (clientId !== data.senderClientId) {
              self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
              });
            }

            if (!handled) {
              handled = true;
              resolve();
              channel.close();
            }
          }
        });

        if (clientList.length > 0) {
          clientList.forEach(client => client.postMessage({ type: 'GET_CLIENT_ID' }));
        } else {
          // Jika tidak ada tab aktif, langsung tampilkan notifikasi
          self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          });
          resolve();
        }

        // Timeout fallback 1 detik
        setTimeout(() => {
          if (!handled) {
            self.registration.showNotification(data.title, {
              body: data.body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-72x72.png',
            });
            channel.close();
            resolve();
          }
        }, 1000);
      });
    })()
  );
});

// Klik notifikasi → buka atau fokus tab utama
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
