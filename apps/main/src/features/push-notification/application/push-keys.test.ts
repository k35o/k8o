import { isValidPushKeys } from './push-keys';

const validP256dh = Buffer.concat([
  Buffer.from([0x04]),
  Buffer.alloc(64),
]).toString('base64url');
const validAuth = Buffer.alloc(16).toString('base64url');

describe('isValidPushKeys', () => {
  describe('正常系', () => {
    it('正しい形式の鍵を許可する', () => {
      expect(isValidPushKeys(validP256dh, validAuth)).toBe(true);
    });

    it('auth は最大32バイトまで許可する', () => {
      const auth32 = Buffer.alloc(32).toString('base64url');
      expect(isValidPushKeys(validP256dh, auth32)).toBe(true);
    });
  });

  describe('異常系', () => {
    it('p256dh が65バイトでないと不許可', () => {
      const short = Buffer.alloc(64).toString('base64url');
      expect(isValidPushKeys(short, validAuth)).toBe(false);
    });

    it('p256dh の先頭が 0x04 でないと不許可', () => {
      const bad = Buffer.concat([
        Buffer.from([0x05]),
        Buffer.alloc(64),
      ]).toString('base64url');
      expect(isValidPushKeys(bad, validAuth)).toBe(false);
    });

    it('auth が16バイト未満だと不許可', () => {
      const short = Buffer.alloc(15).toString('base64url');
      expect(isValidPushKeys(validP256dh, short)).toBe(false);
    });

    it('auth が32バイト超だと不許可', () => {
      const long = Buffer.alloc(33).toString('base64url');
      expect(isValidPushKeys(validP256dh, long)).toBe(false);
    });
  });
});
