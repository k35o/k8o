import { createHash, timingSafeEqual } from 'node:crypto';

// 文字列を固定長(32byte)のダイジェストに正規化する。
// 長さの違いで timingSafeEqual が throw するのを避けつつ、
// 入力長の差異から比較対象を推測されないようにする。
const sha256 = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

// secret 未設定時は常に不許可とし、比較はタイミング攻撃を避けるため
// crypto.timingSafeEqual で定数時間比較する。
export const isAuthorizedBearerRequest = (
  req: Request,
  secret: string | undefined,
): boolean => {
  if (secret === undefined || secret === '') {
    return false;
  }

  const authHeader = req.headers.get('Authorization');
  if (authHeader === null) {
    return false;
  }

  return timingSafeEqual(sha256(authHeader), sha256(`Bearer ${secret}`));
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

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
}
