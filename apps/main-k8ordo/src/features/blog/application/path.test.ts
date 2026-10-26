import { join } from 'node:path';
import { cwd } from 'node:process';

import { describe, expect, it } from 'vitest';

import { blogPath } from './path';

describe('blogPath', () => {
  describe('正常系', () => {
    it('slugから、apps/main にあるブログ記事のMDXファイルパスを生成する', () => {
      const result = blogPath('test-slug');

      expect(result).toBe(
        join(cwd(), '../main/src/content/blog/test-slug/article.mdx'),
      );
    });

    it('英小文字・数字・ハイフンのみのslugを受け付ける', () => {
      const result = blogPath('feature-123');

      expect(result).toBe(
        join(cwd(), '../main/src/content/blog/feature-123/article.mdx'),
      );
    });
  });

  describe('異常系', () => {
    it.each([
      ['パストラバーサル', '../../etc/passwd'],
      ['スラッシュ', 'a/b'],
      ['バックスラッシュ', 'a\\b'],
      ['ドット', '..'],
      ['英大文字', 'Test-Slug'],
      ['空文字', ''],
      ['ヌル文字', 'slug\0'],
    ])('%s を含むslugは例外を投げる', (_name, slug) => {
      expect(() => blogPath(slug)).toThrow(`Invalid slug: ${slug}`);
    });
  });
});
