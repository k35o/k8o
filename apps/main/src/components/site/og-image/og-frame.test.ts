import { describe, expect, it } from 'vitest';

import { ogTitleFontSize } from './og-frame';

// 既定の OG（og-image.tsx）の題の列と同じ寸法
const TEXT_AREA = {
  width: 1004,
  maxHeight: 320,
  sizes: [64, 56, 48, 42],
  min: 38,
};

describe('ogTitleFontSize', () => {
  describe('正常系', () => {
    it('幅と高さに収まる短い題は、いちばん大きい字にする', () => {
      expect(ogTitleFontSize('k8o', TEXT_AREA)).toBe(64);
    });

    it('3 行で収まる題は、長くても大きい字のままにする', () => {
      expect(
        ogTitleFontSize(
          'Panda CSSにみる、ライブラリを直接importしないCSS in JSだからできること',
          TEXT_AREA,
        ),
      ).toBe(64);
    });

    it('大きい字で 4 行に収まらない長い題は、収まる大きさまで字を下げる', () => {
      // 全角 60 字は 64 と 56 で 5 行、48 で 4 行になる
      expect(ogTitleFontSize('あ'.repeat(60), TEXT_AREA)).toBe(48);
    });
  });

  describe('エッジケース', () => {
    it('どの大きさでも収まらない題は min にする', () => {
      expect(ogTitleFontSize('あ'.repeat(200), TEXT_AREA)).toBe(38);
    });

    it('英数字は全角の字の半分ほどの幅に数える', () => {
      // 高さは 1 行ぶん。全角 20 字は 64 でも 48 でも 2 行になって収まらず、英数字 20 字は 64 で 1 行に収まる
      const area = { width: 1004, maxHeight: 90, sizes: [64, 48], min: 32 };

      expect(ogTitleFontSize('a'.repeat(20), area)).toBe(64);
      expect(ogTitleFontSize('あ'.repeat(20), area)).toBe(32);
    });
  });
});
