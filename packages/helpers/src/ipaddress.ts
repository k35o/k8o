import { ipAddress as vercelIpAddress } from '@vercel/functions';

export const ipAddress = (req: Request | Headers): string | undefined => {
  // Cloudflareを経由するとCF-Connecting-IPヘッダーにユーザーのIPアドレスが入っている
  const headers = 'headers' in req ? req.headers : req;
  const cfConnectingIp = headers.get('CF-Connecting-IP');
  if (cfConnectingIp !== null) {
    return cfConnectingIp;
  }

  const xForwardedFor = headers.get('X-Forwarded-For');
  const xForwardedForIp = xForwardedFor?.split(',')[0];
  if (xForwardedForIp !== undefined) {
    return xForwardedForIp.trim();
  }

  const ip = vercelIpAddress(req);
  return ip;
};

if (import.meta.vitest) {
  const { beforeEach, describe, expect, it, vi } = import.meta.vitest;

  vi.mock('@vercel/functions', () => ({
    ipAddress: vi.fn(),
  }));

  describe('ipAddress', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('CF-Connecting-IPがある場合はその値を返す', () => {
      const headers = new Headers({
        'CF-Connecting-IP': '203.0.113.1',
        'X-Forwarded-For': '198.51.100.1',
      });

      expect(ipAddress(headers)).toBe('203.0.113.1');
      expect(vercelIpAddress).not.toHaveBeenCalled();
    });

    it('X-Forwarded-Forがある場合は先頭のIPを返す', () => {
      const headers = new Headers({
        'X-Forwarded-For': '198.51.100.1, 198.51.100.2',
      });

      expect(ipAddress(headers)).toBe('198.51.100.1');
      expect(vercelIpAddress).not.toHaveBeenCalled();
    });

    it('専用ヘッダーがない場合はVercelのipAddressにフォールバックする', () => {
      vi.mocked(vercelIpAddress).mockReturnValue('192.0.2.1');
      const request = new Request('https://example.com');

      expect(ipAddress(request)).toBe('192.0.2.1');
      expect(vercelIpAddress).toHaveBeenCalledWith(request);
    });
  });
}
