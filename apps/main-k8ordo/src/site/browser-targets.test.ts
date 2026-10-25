import { describe, expect, it } from 'vitest';

import { browserTargets } from './browser-targets';

const floor = {
  chrome: '153',
  chrome_android: '153',
  edge: '153',
  firefox: '155',
  firefox_android: '155',
  safari: '27',
  safari_ios: '27',
};

describe('browserTargets', () => {
  describe('正常系', () => {
    it('フロアを、build.target のブラウザごとの版にする', () => {
      expect(browserTargets(floor).build).toStrictEqual([
        'chrome153',
        'edge153',
        'firefox155',
        'safari27',
        'ios27',
      ]);
    });

    it('フロアを、Lightning CSS の版の数にする', () => {
      expect(browserTargets(floor).lightningcss).toStrictEqual({
        chrome: 10_027_008,
        edge: 10_027_008,
        firefox: 10_158_080,
        safari: 1_769_472,
        ios_saf: 1_769_472,
      });
    });

    it('小数点のある版は、マイナーの版まで含める', () => {
      const targets = browserTargets({ ...floor, safari: '17.2' });

      expect(targets.build).toContain('safari17.2');
      expect(targets.lightningcss['safari']).toBe(1_114_624);
    });
  });

  describe('エッジケース', () => {
    it('Android の版がデスクトップより低ければ、低いほうに合わせる', () => {
      const targets = browserTargets({ ...floor, chrome_android: '150' });

      expect(targets.build).toContain('chrome150');
      expect(targets.build).not.toContain('chrome153');
      expect(targets.lightningcss['chrome']).toBe(9_830_400);
    });
  });
});
