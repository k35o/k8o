import { describe, expect, it } from 'vitest';

import { parsePdfDeck } from './deck.ts';

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
      blocks: [
        {
          tag: 'h1',
          lines: [
            { text: '表紙', left: 0.1, top: 0.2, width: 0.3, height: 0.05 },
          ],
        },
        { tag: 'img', alt: '会社の紹介' },
      ],
      notes: '',
      links: [link],
      ...page,
    },
  ],
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

    it('見出しと段落と画像でない文字のまとまりは通さない', () => {
      expect(() =>
        parsePdfDeck(deck({ blocks: [{ tag: 'script', lines: [] }] })),
      ).toThrow('"blocks"');
    });

    it('ページが無いデッキは通さない', () => {
      expect(() => parsePdfDeck({ ...deck(), pages: [] })).toThrow('"pages"');
    });
  });
});
