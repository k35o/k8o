import { describe, expect, it } from 'vitest';

import { parsePdfDeck, pdfPageImage, splitNotes } from './pdf-deck';

const link = {
  href: 'https://k8o.me/blog',
  left: 0.1,
  top: 0.2,
  width: 0.3,
  height: 0.05,
};

const deck = (page: Record<string, unknown> = {}) => ({
  pages: [
    {
      width: 1920,
      height: 1080,
      text: '表紙',
      notes: '',
      links: [link],
      ...page,
    },
  ],
});

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

describe('parsePdfDeck', () => {
  describe('正常系', () => {
    it('マニフェストをそのまま返す', () => {
      expect(parsePdfDeck(deck())).toStrictEqual(deck());
    });
  });

  describe('異常系', () => {
    it('http(s) でないリンクは通さない', () => {
      expect(() =>
        parsePdfDeck(
          deck({ links: [{ ...link, href: 'mailto:k8o@example.com' }] }),
        ),
      ).toThrow('"href"');
    });

    it('ページの外にはみ出す位置のリンクは通さない', () => {
      expect(() =>
        parsePdfDeck(deck({ links: [{ ...link, left: 1.2 }] })),
      ).toThrow('"left"');
    });

    it('ページが無いデッキは通さない', () => {
      expect(() => parsePdfDeck({ ...deck(), pages: [] })).toThrow('"pages"');
    });
  });
});

describe('splitNotes', () => {
  describe('正常系', () => {
    it('--- だけの行でページごとに分け、前後の空白を落とす', () => {
      expect(
        splitNotes('挨拶する\n\n---\n\n自己紹介は短く\n会社名を言う\n'),
      ).toStrictEqual(['挨拶する', '自己紹介は短く\n会社名を言う']);
    });
  });

  describe('エッジケース', () => {
    it('ノートの無いページは空の文字列になる', () => {
      expect(splitNotes('1 枚目\n---\n---\n3 枚目')).toStrictEqual([
        '1 枚目',
        '',
        '3 枚目',
      ]);
    });

    it('行の途中の --- では分けない', () => {
      expect(splitNotes('a --- b')).toStrictEqual(['a --- b']);
    });
  });
});
