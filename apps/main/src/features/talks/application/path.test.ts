import { join } from 'node:path';
import { cwd } from 'node:process';

import { describe, expect, it } from 'vitest';

import { deckMdxPath, pdfDeckPath } from './path';

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
