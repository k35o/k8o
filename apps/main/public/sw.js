// Web Push 通知を受け取るための Service Worker。
// push イベントで通知を表示し、クリックで対象 URL を開く。

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'k8o';
  const options = {
    body: data.body ?? '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: data.url,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// openWindow で開いてよいホスト（任意 URL へのオープンリダイレクトを防ぐ）
const ALLOWED_OPEN_HOSTS = ['k8o.me', 'www.k8o.me'];

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url;
  if (!url) {
    return;
  }

  let target;
  try {
    target = new URL(url, self.location.origin);
  } catch {
    return;
  }

  const isAllowed =
    target.protocol === 'https:' &&
    (target.origin === self.location.origin ||
      ALLOWED_OPEN_HOSTS.includes(target.hostname));
  if (isAllowed) {
    event.waitUntil(clients.openWindow(target.href));
  }
});
