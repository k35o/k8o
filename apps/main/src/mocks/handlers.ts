import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post('/api/blog/views', () => new HttpResponse(null, { status: 204 })),
];
