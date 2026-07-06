import { revalidateTag } from 'next/cache';

import { POST } from './route';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

const makeRequest = ({
  authHeader,
  body,
}: {
  authHeader?: string;
  body?: string;
}): Request =>
  new Request('https://www.k8o.me/api/revalidate', {
    method: 'POST',
    headers: authHeader === undefined ? {} : { Authorization: authHeader },
    body: body ?? null,
  });

describe('POST /api/revalidate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('secret が一致すると revalidateTag を呼び 204 を返す', async () => {
      vi.stubEnv('REVALIDATE_SECRET', 'super-secret');

      const res = await POST(
        makeRequest({
          authHeader: 'Bearer super-secret',
          body: JSON.stringify({ tag: 'db-content' }),
        }),
      );

      expect(res.status).toBe(204);
      expect(revalidateTag).toHaveBeenCalledWith('db-content', 'max');
    });
  });

  describe('異常系', () => {
    it('secret が不一致なら 401 を返し revalidateTag を呼ばない', async () => {
      vi.stubEnv('REVALIDATE_SECRET', 'super-secret');

      const res = await POST(
        makeRequest({
          authHeader: 'Bearer wrong',
          body: JSON.stringify({ tag: 'db-content' }),
        }),
      );

      expect(res.status).toBe(401);
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it('Authorization ヘッダが無ければ 401 を返す', async () => {
      vi.stubEnv('REVALIDATE_SECRET', 'super-secret');

      const res = await POST(
        makeRequest({ body: JSON.stringify({ tag: 'db-content' }) }),
      );

      expect(res.status).toBe(401);
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it('REVALIDATE_SECRET 未設定なら常に 401 を返す', async () => {
      vi.stubEnv('REVALIDATE_SECRET', undefined);

      const res = await POST(
        makeRequest({
          authHeader: 'Bearer anything',
          body: JSON.stringify({ tag: 'db-content' }),
        }),
      );

      expect(res.status).toBe(401);
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it('body が JSON でなければ 400 を返す', async () => {
      vi.stubEnv('REVALIDATE_SECRET', 'super-secret');

      const res = await POST(
        makeRequest({ authHeader: 'Bearer super-secret', body: 'not-json' }),
      );

      expect(res.status).toBe(400);
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it('tag が無い body は 400 を返す', async () => {
      vi.stubEnv('REVALIDATE_SECRET', 'super-secret');

      const res = await POST(
        makeRequest({
          authHeader: 'Bearer super-secret',
          body: JSON.stringify({}),
        }),
      );

      expect(res.status).toBe(400);
      expect(revalidateTag).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('空文字の tag は 400 を返す', async () => {
      vi.stubEnv('REVALIDATE_SECRET', 'super-secret');

      const res = await POST(
        makeRequest({
          authHeader: 'Bearer super-secret',
          body: JSON.stringify({ tag: '' }),
        }),
      );

      expect(res.status).toBe(400);
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it('256文字を超える tag は 400 を返す', async () => {
      vi.stubEnv('REVALIDATE_SECRET', 'super-secret');

      const res = await POST(
        makeRequest({
          authHeader: 'Bearer super-secret',
          body: JSON.stringify({ tag: 'a'.repeat(257) }),
        }),
      );

      expect(res.status).toBe(400);
      expect(revalidateTag).not.toHaveBeenCalled();
    });
  });
});
