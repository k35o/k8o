import { HttpResponse, http } from 'msw/http';

export const handlers = [
  http.post(
    'https://api.k8o.me/public/blogs/:slug/views',
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post(
    'https://api.k8o.me/public/blogs/:slug/feedback',
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post(
    'https://api.k8o.me/public/inquiries',
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post(
    'https://api.k8o.me/public/push-subscriptions',
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.delete(
    'https://api.k8o.me/public/push-subscriptions',
    () => new HttpResponse(null, { status: 204 }),
  ),
  // 日々の表示の差し替えは、story が msw.use で応答を決めない限り失敗させ、ビルド時の値のまま
  // 描かせる。本番の api に出ると、VRT がその日のデータで揺れ、CI が api の上限を食うため
  http.get(
    'https://api.k8o.me/*',
    () => new HttpResponse(null, { status: 503 }),
  ),
];
