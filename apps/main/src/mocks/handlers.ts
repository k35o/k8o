import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post(
    'https://api.k8o.me/public/blogs/:slug/views',
    () => new HttpResponse(null, { status: 204 }),
  ),
];
