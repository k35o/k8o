import { ipAddress as vercelIpAddress } from '@vercel/functions';

export const ipAddress = (req: Request | Headers): string | undefined => {
  // Cloudflareを経由するとCF-Connecting-IPヘッダーにユーザーのIPアドレスが入っている
  const headers = 'headers' in req ? req.headers : req;
  const cfConnectingIp = headers.get('CF-Connecting-IP');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = headers.get('X-Forwarded-For');
  const xForwardedForIp = xForwardedFor?.split(',')[0];
  if (xForwardedForIp) {
    return xForwardedForIp.trim();
  }

  const ip = vercelIpAddress(req);
  return ip;
};

if (import.meta.vitest) {
  const { describe, expect, it, vi, beforeEach } = import.meta.vitest;

  // Vercel関数のモック
  vi.mock('@vercel/functions', () => ({
    ipAddress: vi.fn(),
  }));

  describe('ipAddress', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('正常な入力の場合', () => {
      it('CF-Connecting-IPヘッダーからIPアドレスを取得できるべき', () => {
        const headers = new Headers({
          'CF-Connecting-IP': '203.0.113.1',
        });
        expect(ipAddress(headers)).toBe('203.0.113.1');
      });

      it('X-Forwarded-Forヘッダーから単一IPアドレスを取得できるべき', () => {
        const headers = new Headers({
          'X-Forwarded-For': '203.0.113.2',
        });
        expect(ipAddress(headers)).toBe('203.0.113.2');
      });

      it('X-Forwarded-Forヘッダーから複数IPの最初を取得できるべき', () => {
        const headers = new Headers({
          'X-Forwarded-For': '203.0.113.3, 198.51.100.1, 192.0.2.1',
        });
        expect(ipAddress(headers)).toBe('203.0.113.3');
      });

      it('X-Forwarded-ForのIPアドレスをトリムできるべき', () => {
        const headers = new Headers({
          'X-Forwarded-For': ' 203.0.113.4 , 198.51.100.2',
        });
        expect(ipAddress(headers)).toBe('203.0.113.4');
      });

      it('Requestオブジェクトから取得できるべき', () => {
        const request = new Request('https://example.com', {
          headers: {
            'CF-Connecting-IP': '203.0.113.5',
          },
        });
        expect(ipAddress(request)).toBe('203.0.113.5');
      });
    });

    describe('優先順位の確認', () => {
      it('CF-Connecting-IPがX-Forwarded-Forより優先されるべき', () => {
        const headers = new Headers({
          'CF-Connecting-IP': '203.0.113.10',
          'X-Forwarded-For': '203.0.113.11',
        });
        expect(ipAddress(headers)).toBe('203.0.113.10');
      });

      it('X-Forwarded-ForがVercel関数より優先されるべき', () => {
        const mockVercelIpAddress = vi.mocked(vercelIpAddress);
        mockVercelIpAddress.mockReturnValue('203.0.113.99');

        const headers = new Headers({
          'X-Forwarded-For': '203.0.113.12',
        });
        expect(ipAddress(headers)).toBe('203.0.113.12');
      });

      it('ヘッダーがない場合はVercel関数にフォールバックするべき', () => {
        const mockVercelIpAddress = vi.mocked(vercelIpAddress);
        mockVercelIpAddress.mockReturnValue('203.0.113.100');

        const headers = new Headers();
        expect(ipAddress(headers)).toBe('203.0.113.100');
      });
    });

    describe('異常な入力の場合', () => {
      it('ヘッダーが全くない場合はundefinedを返すべき', () => {
        const mockVercelIpAddress = vi.mocked(vercelIpAddress);
        mockVercelIpAddress.mockReturnValue(undefined);

        const headers = new Headers();
        expect(ipAddress(headers)).toBeUndefined();
      });

      it('X-Forwarded-Forが空文字列の場合は次のフォールバックに進むべき', () => {
        const mockVercelIpAddress = vi.mocked(vercelIpAddress);
        mockVercelIpAddress.mockReturnValue('203.0.113.101');

        const headers = new Headers({
          'X-Forwarded-For': '',
        });
        expect(ipAddress(headers)).toBe('203.0.113.101');
      });
    });

    describe('エッジケースの場合', () => {
      it('X-Forwarded-Forにスペースのみの場合はトリムされた空文字列として扱われるべき', () => {
        const mockVercelIpAddress = vi.mocked(vercelIpAddress);
        mockVercelIpAddress.mockReturnValue('203.0.113.102');

        const headers = new Headers({
          'X-Forwarded-For': '   ',
        });
        // trim後は空文字列になるが、空文字列はtruthyではないのでVercelにフォールバック
        expect(ipAddress(headers)).toBe('203.0.113.102');
      });
    });
  });
}
