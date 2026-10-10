import { HttpResponse, http } from 'msw';

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
];
