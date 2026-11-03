import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ARTICLE, SLUG } from './patterns';

// Vercel は src をパスの全体に当てるので、試すときも全体で当てる
const wholly = (pattern: string): RegExp => new RegExp(`^${pattern}$`, 'u');

const articleSlugs = readdirSync(
  fileURLToPath(new URL('../../../main/src/content/blog', import.meta.url)),
).filter((name) => !name.startsWith('.'));

describe('SLUG', () => {
  describe('正常系', () => {
    it('記事のディレクトリがある', () => {
      expect(articleSlugs).not.toHaveLength(0);
    });

    it.each(articleSlugs)('記事 %s の名前に合う', (slug) => {
      expect(slug).toMatch(wholly(SLUG));
    });
  });

  describe('異常系', () => {
    it.each(['Abs-sign', 'abs_sign', 'abs/sign', ''])(
      '%s には合わない',
      (name) => {
        expect(name).not.toMatch(wholly(SLUG));
      },
    );
  });
});

describe('ARTICLE', () => {
  describe('正常系', () => {
    it.each(articleSlugs)('記事 %s の名前に合う', (slug) => {
      expect(slug).toMatch(wholly(ARTICLE));
    });
  });

  describe('異常系', () => {
    it('フィードの feed には合わない', () => {
      expect('feed').not.toMatch(wholly(ARTICLE));
    });
  });

  describe('エッジケース', () => {
    it('feed で始まるだけの名前には合う', () => {
      expect('feeds').toMatch(wholly(ARTICLE));
    });
  });
});
