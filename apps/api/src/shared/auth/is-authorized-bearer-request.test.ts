import { describe, expect, it } from 'vitest';

import { isAuthorizedBearerRequest } from './is-authorized-bearer-request';

const makeRequest = (authHeader?: string): Request =>
  new Request('https://example.com/api/protected', {
    headers: authHeader === undefined ? {} : { Authorization: authHeader },
  });

describe('isAuthorizedBearerRequest', () => {
  describe('正常系', () => {
    it('正しい Bearer トークンを許可する', () => {
      expect(
        isAuthorizedBearerRequest(
          makeRequest('Bearer super-secret'),
          'super-secret',
        ),
      ).toBe(true);
    });
  });

  describe('異常系', () => {
    it('secret が未設定なら常に不許可', () => {
      expect(
        isAuthorizedBearerRequest(makeRequest('Bearer anything'), undefined),
      ).toBe(false);
    });

    it('secret が空文字なら常に不許可', () => {
      expect(
        isAuthorizedBearerRequest(makeRequest('Bearer anything'), ''),
      ).toBe(false);
    });

    it('Authorization ヘッダが無ければ不許可', () => {
      expect(isAuthorizedBearerRequest(makeRequest(), 'super-secret')).toBe(
        false,
      );
    });

    it('誤ったトークンは不許可', () => {
      expect(
        isAuthorizedBearerRequest(makeRequest('Bearer wrong'), 'super-secret'),
      ).toBe(false);
    });

    it('Bearer プレフィックスが無いと不許可', () => {
      expect(
        isAuthorizedBearerRequest(makeRequest('super-secret'), 'super-secret'),
      ).toBe(false);
    });
  });
});
