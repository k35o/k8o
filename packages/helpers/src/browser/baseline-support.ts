import { CORE_BROWSERS } from './detect-browser';
import type { BaselineMinVersions, DetectedBrowser } from './detect-browser';

// webstatus.dev 由来の browser_implementations と同じ構造。DB 型に依存しないよう
// helpers 内で再定義し、この層をアプリ非依存に保つ。
export type BrowserImplementationMap = Record<
  string,
  { version?: string; status?: string; date?: string }
>;

const NUMERIC_SEGMENT = /^\d+$/u;

export const compareVersions = (a: string, b: string): number => {
  const pa = a.split('.');
  const pb = b.split('.');
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const ra = pa[i];
    const rb = pb[i];
    // 欠けている末尾セグメントは 0 とみなす("17" == "17.0")。空文字や数値以外を
    // 含み比較できない場合は同等扱い(=警告しない)とする。Number('') が 0 になる罠を避ける。
    if (
      (ra !== undefined && !NUMERIC_SEGMENT.test(ra)) ||
      (rb !== undefined && !NUMERIC_SEGMENT.test(rb))
    ) {
      return 0;
    }
    const na = ra === undefined ? 0 : Number(ra);
    const nb = rb === undefined ? 0 : Number(rb);
    if (na !== nb) {
      return na < nb ? -1 : 1;
    }
  }
  return 0;
};

export const isBrowserOutdated = (
  detected: DetectedBrowser | null,
  minVersions: BaselineMinVersions,
): boolean => {
  if (detected === null) {
    return false;
  }
  const min = minVersions[detected.browser];
  if (min === undefined) {
    return false;
  }
  return compareVersions(detected.version, min) < 0;
};

// 与えられた機能群(browser_implementations の配列)について、コアブラウザごとに
// status==='available' な version の最大値を取る。= その機能群がすべて動く最低版。
export const computeMinVersions = (
  implementations: readonly BrowserImplementationMap[],
): BaselineMinVersions => {
  const minVersions: BaselineMinVersions = {};
  for (const impls of implementations) {
    for (const browser of CORE_BROWSERS) {
      const impl = impls[browser];
      if (
        impl?.status !== 'available' ||
        impl.version === undefined ||
        impl.version === ''
      ) {
        continue;
      }
      const current = minVersions[browser];
      if (current === undefined || compareVersions(impl.version, current) > 0) {
        minVersions[browser] = impl.version;
      }
    }
  }
  return minVersions;
};

if (import.meta.vitest) {
  describe('compareVersions', () => {
    describe('正常系', () => {
      it('メジャーバージョンを数値として比較する', () => {
        expect(compareVersions('120', '143')).toBe(-1);
        expect(compareVersions('143', '120')).toBe(1);
        expect(compareVersions('143', '143')).toBe(0);
      });

      it('メジャー.マイナーを比較する', () => {
        expect(compareVersions('17.2', '26.2')).toBe(-1);
        expect(compareVersions('26.5', '26.2')).toBe(1);
        expect(compareVersions('17.10', '17.2')).toBe(1);
      });

      it('桁数が異なる場合は不足分を0として扱う', () => {
        expect(compareVersions('17', '17.2')).toBe(-1);
        expect(compareVersions('17.0', '17')).toBe(0);
      });
    });

    describe('エッジケース', () => {
      it('数値化できない値は同等扱い(0)とする', () => {
        expect(compareVersions('abc', '120')).toBe(0);
      });

      it('空文字は比較不能として同等扱い(0)とする(=警告しない)', () => {
        expect(compareVersions('', '143')).toBe(0);
        expect(compareVersions('143', '')).toBe(0);
      });
    });
  });

  describe('isBrowserOutdated', () => {
    const minVersions: BaselineMinVersions = {
      chrome: '143',
      safari: '26.2',
      firefox: '146',
    };

    describe('正常系', () => {
      it('最低バージョン未満なら true', () => {
        expect(
          isBrowserOutdated({ browser: 'chrome', version: '120' }, minVersions),
        ).toBe(true);
        expect(
          isBrowserOutdated(
            { browser: 'safari', version: '17.2' },
            minVersions,
          ),
        ).toBe(true);
      });

      it('最低バージョン以上なら false', () => {
        expect(
          isBrowserOutdated({ browser: 'chrome', version: '143' }, minVersions),
        ).toBe(false);
        expect(
          isBrowserOutdated({ browser: 'chrome', version: '150' }, minVersions),
        ).toBe(false);
      });
    });

    describe('異常系・エッジケース', () => {
      it('検出できなかった(null)場合は警告しない', () => {
        expect(isBrowserOutdated(null, minVersions)).toBe(false);
      });

      it('マッピングにないブラウザは警告しない', () => {
        expect(
          isBrowserOutdated(
            { browser: 'firefox_android', version: '100' },
            minVersions,
          ),
        ).toBe(false);
      });
    });
  });

  describe('computeMinVersions', () => {
    describe('正常系', () => {
      it('機能ごとに各ブラウザの対応版の最大値を取る', () => {
        const result = computeMinVersions([
          {
            chrome: { status: 'available', version: '120' },
            safari: { status: 'available', version: '17.2' },
          },
          {
            chrome: { status: 'available', version: '143' },
            safari: { status: 'available', version: '17.0' },
          },
        ]);
        expect(result).toEqual({ chrome: '143', safari: '17.2' });
      });
    });

    describe('異常系・エッジケース', () => {
      it('status が available でない実装は無視する', () => {
        const result = computeMinVersions([
          {
            chrome: { status: 'unavailable', version: '150' },
            firefox: { status: 'available', version: '146' },
          },
        ]);
        expect(result).toEqual({ firefox: '146' });
      });

      it('version が無い/空の実装は無視する', () => {
        const result = computeMinVersions([
          {
            chrome: { status: 'available' },
            edge: { status: 'available', version: '' },
          },
        ]);
        expect(result).toEqual({});
      });

      it('コア7ブラウザ以外のキーは対象外とする', () => {
        const result = computeMinVersions([
          {
            opera: { status: 'available', version: '106' },
            chrome: { status: 'available', version: '120' },
          },
        ]);
        expect(result).toEqual({ chrome: '120' });
      });

      it('空配列なら空を返す', () => {
        expect(computeMinVersions([])).toEqual({});
      });
    });
  });
}
