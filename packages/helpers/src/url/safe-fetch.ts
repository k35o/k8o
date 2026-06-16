import { isPublicHttpsUrl } from './is-public-https-url';

const MAX_REDIRECTS = 5;

const fetchFollowing = async (
  url: string,
  init: RequestInit | undefined,
  redirectsLeft: number,
): Promise<Response> => {
  if (!isPublicHttpsUrl(url)) {
    throw new Error(`safeFetch: 許可されない URL です (${url})`);
  }

  const response = await fetch(url, {
    ...init,
    redirect: 'manual',
  });

  if (response.status < 300 || response.status >= 400) {
    return response;
  }

  const location = response.headers.get('location');
  if (location === null || location === '') {
    return response;
  }
  if (redirectsLeft <= 0) {
    throw new Error('safeFetch: リダイレクトが多すぎます');
  }

  return fetchFollowing(
    new URL(location, url).toString(),
    init,
    redirectsLeft - 1,
  );
};

// SSRF 対策済みの fetch。初期 URL とすべてのリダイレクト先を都度 isPublicHttpsUrl で
// 検証し、内部ホストへのアクセスを防ぐ。リダイレクトは手動で追従する（自動追従だと
// 公開 URL から内部 URL へのリダイレクトを検証できないため）。
//
// 検証に通らない URL / リダイレクト過多のときは例外を投げる。呼び出し側で握り潰し、
// 「取得できなかった」として graceful に扱う想定。
export const safeFetch = (url: string, init?: RequestInit): Promise<Response> =>
  fetchFollowing(url, init, MAX_REDIRECTS);

if (import.meta.vitest) {
  const { afterEach, describe, expect, it, vi } = import.meta.vitest;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('safeFetch', () => {
    it('内部 URL は fetch せず例外を投げる', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(safeFetch('https://169.254.169.254/')).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('公開 URL への 200 はそのまま返す', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      const response = await safeFetch('https://example.com/');

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('公開 URL へのリダイレクトは追従する', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(null, {
            status: 301,
            headers: { location: 'https://example.org/next' },
          }),
        )
        .mockResolvedValueOnce(new Response(null, { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      const response = await safeFetch('https://example.com/');

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('内部ホストへのリダイレクトは例外を投げる', async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: 'https://127.0.0.1/admin' },
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(safeFetch('https://example.com/')).rejects.toThrow();
    });
  });
}
