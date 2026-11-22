import { afterEach, describe, expect, it, vi } from 'vitest';

import floorData from '../infrastructure/browser-min-versions.json';
import { BASELINE_PROBES, supportsBaseline } from './baseline-support';

const stubBrowser = ({
  autocorrect = true,
  scrollTimeline = true,
  revertRule = true,
}: {
  autocorrect?: boolean;
  scrollTimeline?: boolean;
  revertRule?: boolean;
} = {}): void => {
  vi.stubGlobal('HTMLElement', {
    prototype: autocorrect ? { autocorrect: true } : {},
  });
  vi.stubGlobal('CSS', {
    supports: (property: string, value: string) =>
      (scrollTimeline &&
        property === 'animation-timeline' &&
        value === 'scroll()') ||
      (revertRule && property === 'color' && value === 'revert-rule'),
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('supportsBaseline', () => {
  describe('正常系', () => {
    it('検出する機能がすべて揃えば対応とする', () => {
      stubBrowser();
      expect(supportsBaseline()).toBe(true);
    });
  });

  describe('異常系', () => {
    it('autocorrect が無ければ（Chrome と Edge の 152 など）非対応とする', () => {
      stubBrowser({ autocorrect: false });
      expect(supportsBaseline()).toBe(false);
    });

    it('scroll() のタイムラインが無ければ（Firefox 158 など）非対応とする', () => {
      stubBrowser({ scrollTimeline: false });
      expect(supportsBaseline()).toBe(false);
    });

    it('revert-rule が無ければ（Safari 26.6 など）非対応とする', () => {
      stubBrowser({ revertRule: false });
      expect(supportsBaseline()).toBe(false);
    });
  });
});

describe('BASELINE_PROBES', () => {
  const probeIds = Object.keys(BASELINE_PROBES);

  describe('正常系', () => {
    it('どのブラウザにも、最低版を決めている機能の検出がある', () => {
      const uncovered = Object.entries(floorData.floorFeatures).filter(
        ([, features]) =>
          !Object.keys(features).some((id) => probeIds.includes(id)),
      );
      expect(
        uncovered,
        '最低版が上がりました。各ブラウザの候補からページで検出できる機能を 1 つ選び、baseline-support.ts の BASELINE_PROBES に足してください',
      ).toEqual([]);
    });

    it('どのブラウザの最低版も決めていない検出は残さない', () => {
      const deciding = new Set(
        Object.values(floorData.floorFeatures).flatMap((features) =>
          Object.keys(features),
        ),
      );
      expect(
        probeIds.filter((id) => !deciding.has(id)),
        '最低版を決めなくなった機能です。baseline-support.ts の BASELINE_PROBES から外してください',
      ).toEqual([]);
    });
  });
});
