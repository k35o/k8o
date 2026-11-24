import { describe, expect, it } from 'vitest';

import { isPdfDeckSlug, pdfPageImage } from './files.ts';

describe('pdfPageImage', () => {
  describe('正常系', () => {
    it('ページの番号を 3 桁にそろえ、幅を名前に入れる', () => {
      expect(pdfPageImage(7, 960)).toBe('pages/007.960w.avif');
    });
  });

  describe('エッジケース', () => {
    it('1000 枚目からは桁が増える', () => {
      expect(pdfPageImage(1000, 1920)).toBe('pages/1000.1920w.avif');
    });
  });
});

describe('isPdfDeckSlug', () => {
  describe('正常系', () => {
    it('小文字の英数字とハイフンの slug を通す', () => {
      expect(isPdfDeckSlug('jsconf-jp-2026')).toBe(true);
    });
  });

  describe('異常系', () => {
    it.each(['../tskaigi-2025', 'talks/x', 'JSConf', 'jsconf jp', ''])(
      '%j は通さない',
      (slug) => {
        expect(isPdfDeckSlug(slug)).toBe(false);
      },
    );
  });
});
