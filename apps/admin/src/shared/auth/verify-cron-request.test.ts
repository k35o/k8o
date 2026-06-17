import { isAuthorizedCronRequest } from './verify-cron-request';

const makeRequest = (authHeader?: string): Request =>
  new Request('https://admin.k8o.localhost/api/crons/sync', {
    headers: authHeader === undefined ? {} : { Authorization: authHeader },
  });

describe('isAuthorizedCronRequest', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('正常系', () => {
    it('正しい Bearer トークンを許可する', () => {
      vi.stubEnv('CRON_SECRET', 'super-secret');
      expect(isAuthorizedCronRequest(makeRequest('Bearer super-secret'))).toBe(
        true,
      );
    });
  });

  describe('異常系', () => {
    it('CRON_SECRET が未設定なら常に不許可', () => {
      vi.stubEnv('CRON_SECRET', undefined);
      expect(isAuthorizedCronRequest(makeRequest('Bearer anything'))).toBe(
        false,
      );
    });

    it('CRON_SECRET が空文字なら常に不許可', () => {
      vi.stubEnv('CRON_SECRET', '');
      expect(isAuthorizedCronRequest(makeRequest('Bearer anything'))).toBe(
        false,
      );
    });

    it('Authorization ヘッダが無ければ不許可', () => {
      vi.stubEnv('CRON_SECRET', 'super-secret');
      expect(isAuthorizedCronRequest(makeRequest())).toBe(false);
    });

    it('誤ったトークンは不許可', () => {
      vi.stubEnv('CRON_SECRET', 'super-secret');
      expect(isAuthorizedCronRequest(makeRequest('Bearer wrong'))).toBe(false);
    });

    it('Bearer プレフィックスが無いと不許可', () => {
      vi.stubEnv('CRON_SECRET', 'super-secret');
      expect(isAuthorizedCronRequest(makeRequest('super-secret'))).toBe(false);
    });
  });
});
