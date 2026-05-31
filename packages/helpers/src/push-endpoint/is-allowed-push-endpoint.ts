// Web Push の購読 endpoint を検証する。
// 匿名で登録された endpoint へ後段（admin の送信処理）が fetch するため、
// 内部URLなどを登録される SSRF を防ぐ目的で https + Push サービスホスト allowlist に限定する。
// allowlist によりプライベートIP / localhost / link-local / IPリテラルは構造的に排除される。

// endpoint URL の長さ上限（Push サービスの endpoint は十分この範囲に収まる）
const MAX_ENDPOINT_LENGTH = 2048;

// 完全一致で許可するホスト（Chrome/Edge の FCM、Firefox の Mozilla autopush）
const ALLOWED_HOSTS: ReadonlySet<string> = new Set([
  'fcm.googleapis.com',
  'updates.push.services.mozilla.com',
]);

// サフィックス一致で許可するホスト（サブドメイン境界のため先頭ドット必須）
// .push.apple.com は Safari/iOS、.notify.windows.com は Windows(WNS)
const ALLOWED_HOST_SUFFIXES: readonly string[] = [
  '.push.apple.com',
  '.notify.windows.com',
];

export const isAllowedPushEndpoint = (endpoint: string): boolean => {
  if (typeof endpoint !== 'string' || endpoint.length > MAX_ENDPOINT_LENGTH) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') {
    return false;
  }

  // userinfo(user:pass@) によるホスト偽装を拒否する
  if (url.username !== '' || url.password !== '') {
    return false;
  }

  // 標準の https ポート以外を拒否する
  if (url.port !== '' && url.port !== '443') {
    return false;
  }

  const host = url.hostname.toLowerCase();

  if (ALLOWED_HOSTS.has(host)) {
    return true;
  }

  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('isAllowedPushEndpoint', () => {
    describe('正常系', () => {
      it('FCM(Chrome/Edge)のendpointを許可する', () => {
        expect(
          isAllowedPushEndpoint('https://fcm.googleapis.com/fcm/send/abc123'),
        ).toBe(true);
      });

      it('Mozilla(Firefox)のendpointを許可する', () => {
        expect(
          isAllowedPushEndpoint(
            'https://updates.push.services.mozilla.com/wpush/v2/abc',
          ),
        ).toBe(true);
      });

      it('Apple(Safari)のサブドメインendpointを許可する', () => {
        expect(
          isAllowedPushEndpoint('https://web.push.apple.com/QABC123'),
        ).toBe(true);
      });

      it('WNS(Windows)のサブドメインendpointを許可する', () => {
        expect(
          isAllowedPushEndpoint('https://db5p.notify.windows.com/w/?token=abc'),
        ).toBe(true);
      });
    });

    describe('異常系', () => {
      it('httpスキームは拒否する', () => {
        expect(
          isAllowedPushEndpoint('http://fcm.googleapis.com/fcm/send/abc'),
        ).toBe(false);
      });

      it('内部IP(クラウドメタデータ)は拒否する', () => {
        expect(
          isAllowedPushEndpoint('http://169.254.169.254/latest/meta-data/'),
        ).toBe(false);
      });

      it('localhostは拒否する', () => {
        expect(isAllowedPushEndpoint('https://localhost:8787/push')).toBe(
          false,
        );
      });

      it('未知のホストは拒否する', () => {
        expect(isAllowedPushEndpoint('https://evil.example.com/push')).toBe(
          false,
        );
      });

      it('allowlistホストを偽装したサブドメイン境界外は拒否する', () => {
        expect(
          isAllowedPushEndpoint('https://web.push.apple.com.attacker.com/x'),
        ).toBe(false);
      });

      it('URLとして不正な文字列は拒否する', () => {
        expect(isAllowedPushEndpoint('not-a-url')).toBe(false);
      });

      it('空文字は拒否する', () => {
        expect(isAllowedPushEndpoint('')).toBe(false);
      });

      it('userinfo(user:pass@)でホストを偽装したURLは拒否する', () => {
        expect(
          isAllowedPushEndpoint(
            'https://fcm.googleapis.com@attacker.com/fcm/send/abc',
          ),
        ).toBe(false);
      });

      it('標準ポート以外を指定したURLは拒否する', () => {
        expect(
          isAllowedPushEndpoint('https://fcm.googleapis.com:8443/fcm/send/abc'),
        ).toBe(false);
      });
    });

    describe('エッジケース', () => {
      it('長さ上限を超えるendpointは拒否する', () => {
        const longEndpoint = `https://fcm.googleapis.com/fcm/send/${'a'.repeat(2048)}`;
        expect(isAllowedPushEndpoint(longEndpoint)).toBe(false);
      });

      it('ホスト名の大文字小文字を区別しない', () => {
        expect(
          isAllowedPushEndpoint('https://FCM.googleapis.com/fcm/send/abc'),
        ).toBe(true);
      });
    });
  });
}
