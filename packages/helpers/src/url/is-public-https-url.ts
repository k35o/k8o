// SSRF 対策: 外部由来の URL を fetch する前に「公開 https URL か」を検証する純粋関数。
// reading-list の記事 / フィード / OGP 取得など、ユーザー由来の URL を取得する箇所で使う。
//
// 拒否するもの:
// - https 以外のスキーム
// - userinfo(user:pass@) によるホスト偽装
// - 非標準ポート
// - localhost / *.localhost / 単一ラベルのイントラネット名
// - ループバック・プライベート・リンクローカル(クラウドメタデータ 169.254.169.254 含む)・
//   予約 IP（IPv4 / IPv6、IPv4-mapped IPv6 を含む）
//
// 注意（残存リスク）: DNS 解決は行わないため、公開ホスト名が内部 IP に解決される
// DNS リバインディングは防げない。リダイレクト先は safe-fetch 側で都度再検証する。

const MAX_URL_LENGTH = 2048;

const parseOctets = (host: string): readonly number[] | null => {
  const parts = host.split('.');
  if (parts.length !== 4) {
    return null;
  }
  const octets = parts.map(Number);
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return null;
  }
  return octets;
};

// IPv4 リテラルがプライベート / 予約レンジかどうか。
// URL パーサは 10 進・8 進・16 進・整数表記を正規化済みのドット 10 進へ直すため、
// ここでは正規化後のドット 10 進だけを見れば十分。
// 拒否レンジ: 0.0.0.0/8, 10/8, 127/8(loopback), 169.254/16(link-local/metadata),
// 172.16/12, 192.168/16, 100.64/10(CGNAT), 224/4 以上(multicast/予約)。
const isPrivateIpv4 = (host: string): boolean => {
  const octets = parseOctets(host);
  if (octets === null) {
    return false;
  }
  const [a, b] = octets as [number, number, number, number];
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
};

// 圧縮表記(::)を含む IPv6 を 8 個の 16bit グループへ展開する。
// new URL() は ::ffff:127.0.0.1 を ::ffff:7f00:1 のような hex 形式へ正規化するため、
// 文字列マッチではなく数値展開して判定する。
const expandIpv6 = (host: string): readonly number[] | null => {
  if (!/^[0-9a-f:]+$/u.test(host)) {
    return null;
  }
  const halves = host.split('::');
  if (halves.length > 2) {
    return null;
  }
  const head = halves[0] === '' ? [] : (halves[0]?.split(':') ?? []);
  const hasGap = halves.length === 2;
  const tail = hasGap && halves[1] !== '' ? (halves[1]?.split(':') ?? []) : [];

  let groups: string[];
  if (hasGap) {
    const missing = 8 - head.length - tail.length;
    if (missing < 0) {
      return null;
    }
    groups = [...head, ...Array.from({ length: missing }, () => '0'), ...tail];
  } else {
    groups = head;
  }
  if (groups.length !== 8) {
    return null;
  }
  return groups.map((group) => Number.parseInt(group || '0', 16));
};

// IPv6 リテラルがプライベート / 予約レンジかどうか。
// 拒否: ::(unspecified), ::1(loopback), ::ffff:0:0/96(IPv4-mapped → IPv4 で判定),
// fc00::/7(ULA), fe80::/10(link-local)。
const isPrivateIpv6 = (host: string): boolean => {
  const h = host.toLowerCase();
  const mappedDotted = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/u.exec(h);
  if (mappedDotted?.[1] !== undefined) {
    return isPrivateIpv4(mappedDotted[1]);
  }

  const groups = expandIpv6(h);
  if (groups === null) {
    return false;
  }
  const [g0, , , , , g5, g6, g7] = groups as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];

  if (groups.slice(0, 7).every((g) => g === 0) && (g7 === 0 || g7 === 1)) {
    return true;
  }
  if (groups.slice(0, 5).every((g) => g === 0) && g5 === 0xff_ff) {
    const a = Math.floor(g6 / 256);
    const b = g6 % 256;
    const c = Math.floor(g7 / 256);
    const d = g7 % 256;
    return isPrivateIpv4(`${a}.${b}.${c}.${d}`);
  }
  if (g0 >= 0xfc_00 && g0 <= 0xfd_ff) {
    return true;
  }
  if (g0 >= 0xfe_80 && g0 <= 0xfe_bf) {
    return true;
  }
  return false;
};

export const isPublicHttpsUrl = (value: string): boolean => {
  if (typeof value !== 'string' || value.length > MAX_URL_LENGTH) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;
  if (url.username !== '' || url.password !== '') return false;
  if (url.port !== '' && url.port !== '443') return false;

  let host = url.hostname.toLowerCase();
  if (host.startsWith('[') && host.endsWith(']')) {
    host = host.slice(1, -1);
  }

  if (host === '' || host === 'localhost' || host.endsWith('.localhost')) {
    return false;
  }

  const isIpv6 = host.includes(':');
  if (!host.includes('.') && !isIpv6) {
    return false;
  }

  if (isIpv6) {
    return !isPrivateIpv6(host);
  }
  return !isPrivateIpv4(host);
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('isPublicHttpsUrl', () => {
    describe('正常系', () => {
      it('公開 https URL を許可する', () => {
        expect(isPublicHttpsUrl('https://example.com/articles/1')).toBe(true);
        expect(isPublicHttpsUrl('https://web.dev/feed.xml')).toBe(true);
        expect(isPublicHttpsUrl('https://example.com:443/x')).toBe(true);
      });

      it('公開 IPv4 リテラルは許可する', () => {
        expect(isPublicHttpsUrl('https://8.8.8.8/')).toBe(true);
      });
    });

    describe('異常系', () => {
      it('http スキームは拒否する', () => {
        expect(isPublicHttpsUrl('http://example.com/')).toBe(false);
      });

      it('localhost を拒否する', () => {
        expect(isPublicHttpsUrl('https://localhost/')).toBe(false);
        expect(isPublicHttpsUrl('https://app.localhost/')).toBe(false);
      });

      it('クラウドメタデータ IP(169.254.169.254)を拒否する', () => {
        expect(isPublicHttpsUrl('https://169.254.169.254/latest/')).toBe(false);
      });

      it('プライベート IPv4 を拒否する', () => {
        expect(isPublicHttpsUrl('https://10.0.0.1/')).toBe(false);
        expect(isPublicHttpsUrl('https://192.168.1.1/')).toBe(false);
        expect(isPublicHttpsUrl('https://172.16.0.1/')).toBe(false);
        expect(isPublicHttpsUrl('https://127.0.0.1/')).toBe(false);
      });

      it('整数表記でループバックを指定しても正規化して拒否する', () => {
        expect(isPublicHttpsUrl('https://2130706433/')).toBe(false);
      });

      it('プライベート / ループバック IPv6 を拒否する', () => {
        expect(isPublicHttpsUrl('https://[::1]/')).toBe(false);
        expect(isPublicHttpsUrl('https://[fc00::1]/')).toBe(false);
        expect(isPublicHttpsUrl('https://[fe80::1]/')).toBe(false);
        expect(isPublicHttpsUrl('https://[::ffff:127.0.0.1]/')).toBe(false);
      });

      it('userinfo でホストを偽装した URL を拒否する', () => {
        expect(isPublicHttpsUrl('https://example.com@169.254.169.254/')).toBe(
          false,
        );
      });

      it('非標準ポートを拒否する', () => {
        expect(isPublicHttpsUrl('https://example.com:8443/')).toBe(false);
      });

      it('単一ラベルのイントラネット名を拒否する', () => {
        expect(isPublicHttpsUrl('https://intranet/')).toBe(false);
      });

      it('URL として不正な文字列を拒否する', () => {
        expect(isPublicHttpsUrl('not a url')).toBe(false);
        expect(isPublicHttpsUrl('')).toBe(false);
      });

      it('長すぎる URL を拒否する', () => {
        expect(
          isPublicHttpsUrl(`https://example.com/${'a'.repeat(2048)}`),
        ).toBe(false);
      });
    });
  });
}
