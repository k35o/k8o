// display: 'standalone' は iOS で Web Push を受け取るための必須条件（ホーム追加でインストールしたPWAのみ受信可）。
const manifest = {
  name: 'k8o',
  short_name: 'k8o',
  description: 'k8oの活動や制作物をまとめた個人サイト',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  icons: [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
  ],
};

export function GET(): Response {
  return Response.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
