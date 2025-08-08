import { HttpResponse, http } from 'msw';

export const handlers = [
  http.post('/api/blog/views', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
