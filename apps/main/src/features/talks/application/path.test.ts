import { join } from 'node:path';
import { cwd } from 'node:process';

import { describe, expect, it } from 'vitest';

import { deckMdxPath, pdfDeckPath, pdfPageImagePath } from './path';

describe('deckMdxPath', () => {
  describe('正常系', () => {
    it('slug から MDX のデッキのパスを生成する', () => {
      expect(deckMdxPath('test-slug')).toBe(
        join(cwd(), 'src/content/talks/test-slug/content.mdx'),
      );
    });
  });
});

describe('pdfDeckPath', () => {
  describe('正常系', () => {
    it('slug から PDF のデッキのマニフェストのパスを生成する', () => {
      expect(pdfDeckPath('test-slug')).toBe(
        join(cwd(), 'public/talks/test-slug/deck.json'),
      );
    });
  });
});

describe('pdfPageImagePath', () => {
  describe('正常系', () => {
    it('slug とページと幅から、取り込んだページの画像のパスを生成する', () => {
      expect(pdfPageImagePath('test-slug', 1, 1920)).toBe(
        join(cwd(), 'public/talks/test-slug/pages/001.1920w.avif'),
      );
    });
  });
});
