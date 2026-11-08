import { isNotFound } from '@k8ordo/framework';
import { getPublishedBlogs } from '@repo/api/build-data';
import type { PublishedBlog } from '@repo/api/build-data';
import { describe, expect, it, vi } from 'vitest';

import { findBlogMetadata } from '@/features/blog/application/blog';

import { getMarkdown } from './markdown';
import {
  findBlogContent,
  findBlogMarkdown,
  getBlogContent,
  getBlogContents,
  getBlogsByTags,
  getFeatureBlogMap,
} from './queries';

vi.mock('@repo/api/build-data', () => ({ getPublishedBlogs: vi.fn() }));
vi.mock('@/features/blog/application/blog', () => ({
  findBlogMetadata: vi.fn(),
  getBlogToc: vi.fn(),
}));
vi.mock('@/features/blog/application/og-code', () => ({
  getBlogOgCode: vi.fn(),
}));
vi.mock('./markdown', () => ({ getMarkdown: vi.fn() }));

const CSS = { id: 3, name: 'CSS' };
const BASELINE = { id: 5, name: 'Baseline' };
const REACT = { id: 7, name: 'React' };

const published = (
  id: number,
  slug: string,
  tags: PublishedBlog['tags'] = [],
  slideUrl: string | null = null,
): PublishedBlog => ({ id, slug, tags, slideUrl });

// MDX の frontmatter。missing に挙げた記事は MDX が無い
const mockMetadata = (
  missing: readonly string[] = [],
  featureIds: Readonly<Record<string, string[]>> = {},
): void => {
  vi.mocked(findBlogMetadata).mockImplementation((slug) =>
    Promise.resolve(
      missing.includes(slug)
        ? null
        : {
            title: `題 ${slug}`,
            description: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
            ...(featureIds[slug] === undefined
              ? {}
              : { featureIds: featureIds[slug] }),
          },
    ),
  );
};

describe('getBlogContents', () => {
  describe('正常系', () => {
    it('api の一覧の並びのまま、タグの名前・MDX の題と日付・読了時間を付けて返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        published(2, 'blog-b', [CSS, BASELINE]),
        published(1, 'blog-a'),
      ]);
      mockMetadata();
      vi.mocked(getMarkdown).mockResolvedValue('本文');

      await expect(getBlogContents()).resolves.toStrictEqual([
        {
          id: 2,
          slug: 'blog-b',
          tags: ['CSS', 'Baseline'],
          title: '題 blog-b',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
          readingTime: 1,
        },
        {
          id: 1,
          slug: 'blog-a',
          tags: [],
          title: '題 blog-a',
          description: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
          readingTime: 1,
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('DB では公開済みでも MDX が無い記事は挙げない', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        published(1, 'blog-a'),
        published(2, 'missing-blog'),
      ]);
      mockMetadata(['missing-blog']);
      vi.mocked(getMarkdown).mockResolvedValue('本文');

      const result = await getBlogContents();

      expect(result.map((blog) => blog.slug)).toStrictEqual(['blog-a']);
    });

    it('api が DB を読めないときは空にせず失敗させる', async () => {
      vi.mocked(getPublishedBlogs).mockRejectedValue(
        new Error('DB に繋がらない'),
      );

      await expect(getBlogContents()).rejects.toThrow('DB に繋がらない');
    });
  });
});

describe('findBlogContent', () => {
  describe('正常系', () => {
    it('一覧の記事を、タグの ID と名前・発表のスライドの URL つきで返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        published(1, 'blog-a', [CSS], 'https://example.com/slide.pdf'),
      ]);
      mockMetadata();

      await expect(findBlogContent('blog-a')).resolves.toStrictEqual({
        id: 1,
        slug: 'blog-a',
        tags: [CSS],
        slideUrl: 'https://example.com/slide.pdf',
        title: '題 blog-a',
        description: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });
  });

  describe('異常系', () => {
    it('一覧に無い記事（下書き・存在しない）は null を返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([published(1, 'blog-a')]);
      mockMetadata();

      await expect(findBlogContent('draft-blog')).resolves.toBeNull();
    });

    it('DB では公開済みでも MDX が無い記事は null を返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        published(1, 'missing-blog'),
      ]);
      mockMetadata(['missing-blog']);

      await expect(findBlogContent('missing-blog')).resolves.toBeNull();
    });
  });
});

describe('getBlogContent', () => {
  describe('異常系', () => {
    it('一覧に無い記事は notFound() で 404 にする', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([]);

      await expect(getBlogContent('draft-blog')).rejects.toSatisfy(isNotFound);
    });
  });
});

describe('findBlogMarkdown', () => {
  describe('正常系', () => {
    it('一覧の記事は markdown を返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([published(1, 'blog-a')]);
      mockMetadata();
      vi.mocked(getMarkdown).mockResolvedValue('# 題\n\n本文');

      await expect(findBlogMarkdown('blog-a')).resolves.toBe('# 題\n\n本文');
    });
  });

  describe('異常系', () => {
    it('一覧に無い記事は null を返し、本文を読まない', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([]);
      vi.mocked(getMarkdown).mockClear();

      await expect(findBlogMarkdown('draft-blog')).resolves.toBeNull();
      expect(getMarkdown).not.toHaveBeenCalled();
    });
  });
});

describe('getBlogsByTags', () => {
  describe('正常系', () => {
    it('タグを共有する記事を、共有するタグの多い順に、題・公開日・タグの名前つきで返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        published(4, 'one-tag', [CSS]),
        published(3, 'no-tag', [REACT]),
        published(2, 'two-tags', [CSS, BASELINE]),
        published(1, 'current', [CSS, BASELINE]),
      ]);
      mockMetadata();

      await expect(getBlogsByTags('current')).resolves.toStrictEqual([
        {
          id: 2,
          slug: 'two-tags',
          title: '題 two-tags',
          createdAt: '2026-01-01T00:00:00.000Z',
          tags: ['CSS', 'Baseline'],
        },
        {
          id: 4,
          slug: 'one-tag',
          title: '題 one-tag',
          createdAt: '2026-01-01T00:00:00.000Z',
          tags: ['CSS'],
        },
      ]);
    });

    it('共有するタグの数が同じなら、一覧の並び（新しい順）のまま 6 件までを返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        ...Array.from({ length: 8 }, (_, index) =>
          published(10 - index, `blog-${(10 - index).toString()}`, [CSS]),
        ),
        published(1, 'current', [CSS]),
      ]);
      mockMetadata();

      const result = await getBlogsByTags('current');

      expect(result.map((blog) => blog.slug)).toStrictEqual([
        'blog-10',
        'blog-9',
        'blog-8',
        'blog-7',
        'blog-6',
        'blog-5',
      ]);
    });
  });

  describe('異常系', () => {
    it('MDX の無い記事を外したうえで 6 件を選ぶ', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        ...Array.from({ length: 7 }, (_, index) =>
          published(10 - index, `blog-${(10 - index).toString()}`, [CSS]),
        ),
        published(1, 'current', [CSS]),
      ]);
      mockMetadata(['blog-10']);

      const result = await getBlogsByTags('current');

      expect(result.map((blog) => blog.slug)).toStrictEqual([
        'blog-9',
        'blog-8',
        'blog-7',
        'blog-6',
        'blog-5',
        'blog-4',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('一覧に無い記事なら空の配列を返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        published(2, 'blog-b', [CSS]),
      ]);
      mockMetadata();

      await expect(getBlogsByTags('missing-blog')).resolves.toStrictEqual([]);
    });
  });
});

describe('getFeatureBlogMap', () => {
  describe('正常系', () => {
    it('MDX の featureIds から、機能ごとに記事の slug と題を引ける表を返す', async () => {
      vi.mocked(getPublishedBlogs).mockResolvedValue([
        published(2, 'blog-b'),
        published(1, 'blog-a'),
      ]);
      mockMetadata([], { 'blog-a': ['popover'], 'blog-b': ['anchor'] });

      await expect(getFeatureBlogMap()).resolves.toStrictEqual({
        anchor: { slug: 'blog-b', title: '題 blog-b' },
        popover: { slug: 'blog-a', title: '題 blog-a' },
      });
    });
  });
});
