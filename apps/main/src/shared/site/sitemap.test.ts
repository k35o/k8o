import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBlogContents } from '@/features/blog/interface/queries';
import { getSlideContents } from '@/features/slides/interface/queries';
import { getTags } from '@/features/tags/interface/queries';

import { generateSitemap } from './sitemap';

vi.mock('@/features/blog/interface/queries', () => ({
  getBlogContents: vi.fn(),
}));
vi.mock('@/features/slides/interface/queries', () => ({
  getSlideContents: vi.fn(),
}));
vi.mock('@/features/tags/interface/queries', () => ({
  getTag: vi.fn(),
  getTags: vi.fn(),
}));
vi.mock('@playgrounds/sections', () => ({
  playgroundSections: [
    {
      id: 'zeta-demo',
      title: 'Zetaのデモ',
      description: 'デモの説明。',
      category: 'css',
      demos: [],
      type: 'standalone',
    },
    {
      id: 'alpha-demo',
      title: 'Alphaのデモ',
      description: 'デモの説明。',
      category: 'css',
      demos: [],
      type: 'standalone',
    },
  ],
}));
vi.mock('@/shared/site/site-entries', () => ({
  siteEntries: [
    {
      title: 'Blog',
      link: '/blog',
      description: 'ブログの説明。',
      kind: 'reading',
      icon: 'blog',
    },
    {
      title: 'Talks',
      link: '/talks',
      description: 'トークの説明。',
      kind: 'reading',
      icon: 'talks',
    },
    {
      title: 'External Tool',
      link: 'https://example.com/tool',
      description: '外部ツールの説明。',
      kind: 'tool',
      icon: 'fluida',
    },
    {
      title: 'カラーコード職人',
      link: '/color-converter',
      description: '色変換の説明。',
      kind: 'tool',
      icon: 'colorConverter',
    },
  ],
}));

type BlogContent = Awaited<ReturnType<typeof getBlogContents>>[number];
type SlideContent = Awaited<ReturnType<typeof getSlideContents>>[number];
type Tag = Awaited<ReturnType<typeof getTags>>[number];

const blog = (overrides: Partial<BlogContent> = {}): BlogContent => ({
  id: 1,
  slug: 'sample-post',
  tags: ['CSS'],
  title: 'サンプル記事',
  description: '記事の説明。',
  createdAt: '2026-01-05',
  updatedAt: '2026-01-06',
  readingTime: 3,
  ...overrides,
});

const slide = (overrides: Partial<SlideContent> = {}): SlideContent => ({
  id: 1,
  slug: 'sample-deck',
  tags: ['CSS'],
  title: 'サンプルデッキ',
  description: 'デッキの説明。',
  createdAt: '2026-01-05',
  updatedAt: '2026-01-06',
  ...overrides,
});

const tag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 1,
  name: 'CSS',
  blogIds: [1],
  talkCount: 0,
  ...overrides,
});

const locsOf = (xml: string): string[] =>
  [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1] ?? '');

describe('generateSitemap', () => {
  beforeEach(() => {
    vi.mocked(getBlogContents).mockResolvedValue([]);
    vi.mocked(getSlideContents).mockResolvedValue([]);
    vi.mocked(getTags).mockResolvedValue([]);
  });

  describe('正常系', () => {
    it('Nextのsitemap.tsと同じ並び・lastmod・changefreqで、resolveSitemapと同じ書き方のXMLを返すべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([
        blog({ id: 2, slug: 'older-update', updatedAt: '2026-10-10' }),
        blog({ id: 1, slug: 'newer-update', updatedAt: '2026-10-20' }),
      ]);
      vi.mocked(getSlideContents).mockResolvedValue([
        slide({ slug: 'sample-deck', updatedAt: '2026-10-25' }),
      ]);
      vi.mocked(getTags).mockResolvedValue([tag({ id: 12 }), tag({ id: 3 })]);

      const xml = await generateSitemap();

      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://k8o.me</loc>
<lastmod>2026-10-25T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://k8o.me/about</loc>
</url>
<url>
<loc>https://k8o.me/contact</loc>
</url>
<url>
<loc>https://k8o.me/privacy</loc>
</url>
<url>
<loc>https://k8o.me/blog</loc>
<lastmod>2026-10-20T00:00:00.000Z</lastmod>
<changefreq>weekly</changefreq>
</url>
<url>
<loc>https://k8o.me/blog/older-update</loc>
<lastmod>2026-10-10T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://k8o.me/blog/newer-update</loc>
<lastmod>2026-10-20T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://k8o.me/slides</loc>
<lastmod>2026-10-25T00:00:00.000Z</lastmod>
<changefreq>weekly</changefreq>
</url>
<url>
<loc>https://k8o.me/slides/sample-deck</loc>
<lastmod>2026-10-25T00:00:00.000Z</lastmod>
</url>
<url>
<loc>https://k8o.me/tags</loc>
</url>
<url>
<loc>https://k8o.me/tags/12</loc>
</url>
<url>
<loc>https://k8o.me/tags/3</loc>
</url>
<url>
<loc>https://k8o.me/playgrounds/zeta-demo</loc>
</url>
<url>
<loc>https://k8o.me/playgrounds/alpha-demo</loc>
</url>
<url>
<loc>https://k8o.me/talks</loc>
</url>
<url>
<loc>https://k8o.me/color-converter</loc>
</url>
</urlset>
`);
    });

    it('トップのlastmodは記事とデッキを合わせて最も新しい更新日、/blogと/slidesはそれぞれの最も新しい更新日にするべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([
        blog({ slug: 'a', updatedAt: '2026-03-01' }),
        blog({ slug: 'b', updatedAt: '2026-09-01' }),
        blog({ slug: 'c', updatedAt: '2026-06-01' }),
      ]);
      vi.mocked(getSlideContents).mockResolvedValue([
        slide({ slug: 'd', updatedAt: '2026-04-01' }),
        slide({ slug: 'e', updatedAt: '2026-08-01' }),
      ]);

      const xml = await generateSitemap();

      expect(xml).toContain(
        '<loc>https://k8o.me</loc>\n<lastmod>2026-09-01T00:00:00.000Z</lastmod>\n</url>',
      );
      expect(xml).toContain(
        '<loc>https://k8o.me/blog</loc>\n<lastmod>2026-09-01T00:00:00.000Z</lastmod>\n<changefreq>weekly</changefreq>\n</url>',
      );
      expect(xml).toContain(
        '<loc>https://k8o.me/slides</loc>\n<lastmod>2026-08-01T00:00:00.000Z</lastmod>\n<changefreq>weekly</changefreq>\n</url>',
      );
    });

    it('内部ページはsiteEntriesの並びのまま、https://で始まるものと/blogを除いて載せるべき', async () => {
      const xml = await generateSitemap();

      expect(locsOf(xml).slice(-2)).toStrictEqual([
        'https://k8o.me/talks',
        'https://k8o.me/color-converter',
      ]);
      expect(xml).not.toContain('https://example.com/tool');
      expect(
        locsOf(xml).filter((loc) => loc === 'https://k8o.me/blog'),
      ).toHaveLength(1);
    });

    it('固定のページはトップ・About・Contact・Privacy・/blog・/slides・/tagsだけで、/notificationsを載せないべき', async () => {
      const xml = await generateSitemap();

      expect(locsOf(xml)).toStrictEqual([
        'https://k8o.me',
        'https://k8o.me/about',
        'https://k8o.me/contact',
        'https://k8o.me/privacy',
        'https://k8o.me/blog',
        'https://k8o.me/slides',
        'https://k8o.me/tags',
        'https://k8o.me/playgrounds/zeta-demo',
        'https://k8o.me/playgrounds/alpha-demo',
        'https://k8o.me/talks',
        'https://k8o.me/color-converter',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('公開済みの記事もトークも持たないタグは載せないべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([
        blog({ id: 1, slug: 'a' }),
        blog({ id: 2, slug: 'b' }),
      ]);
      vi.mocked(getTags).mockResolvedValue([
        tag({ id: 147, blogIds: [], talkCount: 0 }),
        tag({ id: 5, blogIds: [], talkCount: 1 }),
        tag({ id: 8, blogIds: [1, 2], talkCount: 0 }),
      ]);

      const xml = await generateSitemap();

      expect(
        locsOf(xml).filter((loc) => loc.startsWith('https://k8o.me/tags/')),
      ).toStrictEqual(['https://k8o.me/tags/5', 'https://k8o.me/tags/8']);
    });

    it('MDXの無い公開済みの記事だけを持つタグは載せないべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([blog({ id: 1 })]);
      vi.mocked(getTags).mockResolvedValue([
        tag({ id: 9, blogIds: [7], talkCount: 0 }),
        tag({ id: 8, blogIds: [1], talkCount: 0 }),
      ]);

      const xml = await generateSitemap();

      expect(
        locsOf(xml).filter((loc) => loc.startsWith('https://k8o.me/tags/')),
      ).toStrictEqual(['https://k8o.me/tags/8']);
    });

    it('記事とデッキが0件のとき、トップ・/blog・/slidesにlastmodを書かないべき', async () => {
      const xml = await generateSitemap();

      expect(xml).toContain(
        '<url>\n<loc>https://k8o.me</loc>\n</url>\n<url>\n<loc>https://k8o.me/about</loc>',
      );
      expect(xml).toContain(
        '<url>\n<loc>https://k8o.me/blog</loc>\n<changefreq>weekly</changefreq>\n</url>\n<url>\n<loc>https://k8o.me/slides</loc>\n<changefreq>weekly</changefreq>\n</url>',
      );
      expect(xml).not.toContain('<lastmod>');
    });

    it('時差つきのupdatedAtはUTCに直したISO 8601の文字列で書くべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([
        blog({ slug: 'jst', updatedAt: '2026-10-10T09:00:00+09:00' }),
        blog({ slug: 'utc', updatedAt: '2026-10-11T00:00:00+00:00' }),
      ]);

      const xml = await generateSitemap();

      expect(xml).toContain(
        '<loc>https://k8o.me/blog/jst</loc>\n<lastmod>2026-10-10T00:00:00.000Z</lastmod>',
      );
      expect(xml).toContain(
        '<loc>https://k8o.me/blog/utc</loc>\n<lastmod>2026-10-11T00:00:00.000Z</lastmod>',
      );
    });
  });
});
