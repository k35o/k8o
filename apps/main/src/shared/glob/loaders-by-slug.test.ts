import { describe, expect, it } from 'vitest';

import { loadersBySlug } from './loaders-by-slug';

const PATTERN = /\/blog\/([a-z0-9-]+)\/article\.mdx$/u;

describe('loadersBySlug', () => {
  describe('正常系', () => {
    it('ファイル名の slug から、そのファイルの loader を引ける', async () => {
      const loaders = loadersBySlug(
        {
          '/content/blog/first-post/article.mdx': async () => 'first',
          '/content/blog/second-post/article.mdx': async () => 'second',
        },
        PATTERN,
      );

      expect([...loaders.keys()]).toStrictEqual(['first-post', 'second-post']);
      await expect(loaders.get('second-post')?.()).resolves.toBe('second');
    });
  });

  describe('エッジケース', () => {
    it('pattern に当たらないファイルは載せない', () => {
      const loaders = loadersBySlug(
        { '/content/blog/Draft_Post/article.mdx': async () => 'draft' },
        PATTERN,
      );

      expect(loaders.size).toBe(0);
    });
  });
});
