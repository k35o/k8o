// 不正な JSON ペイロードでも通知を黙ってドロップしないようフォールバックする
const parsePushData = (event) => {
  if (!event.data) {
    return {};
  }
  try {
    return event.data.json();
  } catch {
    return {};
  }
};

self.addEventListener('push', (event) => {
  const data = parsePushData(event);
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
