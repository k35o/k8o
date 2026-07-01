import type { BaselineMinVersions, DetectedBrowser } from './detect-browser';

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
}
