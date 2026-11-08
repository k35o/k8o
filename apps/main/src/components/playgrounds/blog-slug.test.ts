import type { PlaygroundSection } from '@playgrounds/types';
import { describe, expect, it, vi } from 'vitest';

import { blogSlugOf } from './blog-slug';

vi.mock('@/features/blog/interface/queries', () => ({
  getBlogContents: vi.fn(),
}));

const base: Omit<PlaygroundSection, 'type' | 'slug'> = {
  id: 'popover',
  title: 'Popover',
  description: '説明',
  category: 'html',
  demos: [],
};

const blogSection: PlaygroundSection = {
  ...base,
  type: 'blog',
  slug: 'popover-api',
};

describe('blogSlugOf', () => {
  describe('正常系', () => {
    it('解説記事が公開済みなら slug を返す', () => {
      expect(blogSlugOf(blogSection, new Set(['popover-api']))).toBe(
        'popover-api',
      );
    });
  });

  describe('異常系', () => {
    it('解説記事が下書きや MDX の無い記事なら undefined を返す', () => {
      expect(blogSlugOf(blogSection, new Set(['other']))).toBeUndefined();
    });
  });

  describe('エッジケース', () => {
    it('記事の無いセクションは undefined を返す', () => {
      expect(
        blogSlugOf({ ...base, type: 'standalone' }, new Set(['popover-api'])),
      ).toBeUndefined();
    });
  });
});
