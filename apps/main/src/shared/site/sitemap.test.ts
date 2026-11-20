import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBlogContents } from '@/features/blog/interface/queries';
import type { BlogSummary } from '@/features/blog/interface/queries';
import { getTags } from '@/features/tags/interface/queries';
import { getTalkDecks } from '@/features/talks/interface/queries';

import { generateSitemap } from './sitemap';

vi.mock('@/features/blog/interface/queries', () => ({
  getBlogContents: vi.fn(),
}));
vi.mock('@/features/tags/interface/queries', () => ({
  getTag: vi.fn(),
  getTags: vi.fn(),
}));
vi.mock('@/features/talks/interface/queries', () => ({
  getTalks: vi.fn(),
  getTalkDecks: vi.fn(),
}));
vi.mock('@/shared/site/site-entries', () => ({
  siteEntries: [
    {
      title: 'Blog',
      link: '/blog',
      description: 'ブログの説明。',
    },
    {
      title: 'Talks',
      link: '/talks',
      description: 'トークの説明。',
    },
    {
      title: 'External Tool',
      link: 'https://example.com/tool',
      description: '外部ツールの説明。',
    },
    {
      title: 'カラーHexクイズ',
      link: '/color-quiz',
      description: 'クイズの説明。',
    },
  ],
}));

type TalkDeck = Awaited<ReturnType<typeof getTalkDecks>>[number];
type Tag = Awaited<ReturnType<typeof getTags>>[number];

const blog = (overrides: Partial<BlogSummary> = {}): BlogSummary => ({
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

const deck = (slug: string, eventDate: string): TalkDeck => ({
  id: 1,
  title: 'サンプルトーク',
  eventUrl: 'https://example.com/event',
  eventName: 'サンプルイベント',
  eventDate,
  eventLocation: null,
  blog: null,
  tags: [],
  deck: { slug, kind: 'pdf' },
  cover: null,
  slidesHref: `/talks/${slug}`,
});

const tag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 1,
  name: 'CSS',
  blogIds: [1],
  talkIds: [],
  ...overrides,
});

const locsOf = (xml: string): string[] =>
  [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1] ?? '');

describe('generateSitemap', () => {
  beforeEach(() => {
    vi.mocked(getBlogContents).mockResolvedValue([]);
    vi.mocked(getTalkDecks).mockResolvedValue([]);
    vi.mocked(getTags).mockResolvedValue([]);
  });

  describe('正常系', () => {
    it('トップ・固定のページ・記事・デッキ・タグの順に、lastmod と changefreq を付けた XML を返すべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([
        blog({ id: 2, slug: 'older-update', updatedAt: '2026-10-10' }),
        blog({ id: 1, slug: 'newer-update', updatedAt: '2026-10-20' }),
      ]);
      vi.mocked(getTalkDecks).mockResolvedValue([
        deck('sample-talk', '2026-10-25'),
      ]);
      vi.mocked(getTags).mockResolvedValue([tag({ id: 12 }), tag({ id: 3 })]);

      const xml = await generateSitemap();

      expect(xml).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://k8o.me</loc>
<lastmod>2026-10-20T00:00:00.000Z</lastmod>
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
<loc>https://k8o.me/talks/sample-talk</loc>
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
<loc>https://k8o.me/talks</loc>
</url>
<url>
<loc>https://k8o.me/color-quiz</loc>
</url>
</urlset>
`);
    });

    it('トップと/blogのlastmodは記事の最も新しい更新日、デッキのlastmodは登壇の日にするべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([
        blog({ slug: 'a', updatedAt: '2026-03-01' }),
        blog({ slug: 'b', updatedAt: '2026-09-01' }),
        blog({ slug: 'c', updatedAt: '2026-06-01' }),
      ]);
      vi.mocked(getTalkDecks).mockResolvedValue([deck('d', '2026-12-01')]);

      const xml = await generateSitemap();

      expect(xml).toContain(
        '<loc>https://k8o.me</loc>\n<lastmod>2026-09-01T00:00:00.000Z</lastmod>\n</url>',
      );
      expect(xml).toContain(
        '<loc>https://k8o.me/blog</loc>\n<lastmod>2026-09-01T00:00:00.000Z</lastmod>\n<changefreq>weekly</changefreq>\n</url>',
      );
      expect(xml).toContain(
        '<loc>https://k8o.me/talks/d</loc>\n<lastmod>2026-12-01T00:00:00.000Z</lastmod>\n</url>',
      );
    });

    it('内部ページはsiteEntriesの並びのまま、https://で始まるものと/blogを除いて載せるべき', async () => {
      const xml = await generateSitemap();

      expect(locsOf(xml).slice(-2)).toStrictEqual([
        'https://k8o.me/talks',
        'https://k8o.me/color-quiz',
      ]);
      expect(xml).not.toContain('https://example.com/tool');
      expect(
        locsOf(xml).filter((loc) => loc === 'https://k8o.me/blog'),
      ).toHaveLength(1);
    });

    it('固定のページはトップ・About・Contact・Privacy・/blog・/tagsだけで、/notificationsを載せないべき', async () => {
      const xml = await generateSitemap();

      expect(locsOf(xml)).toStrictEqual([
        'https://k8o.me',
        'https://k8o.me/about',
        'https://k8o.me/contact',
        'https://k8o.me/privacy',
        'https://k8o.me/blog',
        'https://k8o.me/tags',
        'https://k8o.me/talks',
        'https://k8o.me/color-quiz',
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
        tag({ id: 147, blogIds: [], talkIds: [] }),
        tag({ id: 5, blogIds: [], talkIds: [3] }),
        tag({ id: 8, blogIds: [1, 2], talkIds: [] }),
      ]);

      const xml = await generateSitemap();

      expect(
        locsOf(xml).filter((loc) => loc.startsWith('https://k8o.me/tags/')),
      ).toStrictEqual(['https://k8o.me/tags/5', 'https://k8o.me/tags/8']);
    });

    it('MDXの無い公開済みの記事だけを持つタグは載せないべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([blog({ id: 1 })]);
      vi.mocked(getTags).mockResolvedValue([
        tag({ id: 9, blogIds: [7], talkIds: [] }),
        tag({ id: 8, blogIds: [1], talkIds: [] }),
      ]);

      const xml = await generateSitemap();

      expect(
        locsOf(xml).filter((loc) => loc.startsWith('https://k8o.me/tags/')),
      ).toStrictEqual(['https://k8o.me/tags/8']);
    });

    it('記事が0件のとき、トップと/blogにlastmodを書かないべき', async () => {
      const xml = await generateSitemap();

      expect(xml).toContain(
        '<url>\n<loc>https://k8o.me</loc>\n</url>\n<url>\n<loc>https://k8o.me/about</loc>',
      );
      expect(xml).toContain(
        '<url>\n<loc>https://k8o.me/blog</loc>\n<changefreq>weekly</changefreq>\n</url>\n<url>\n<loc>https://k8o.me/tags</loc>',
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
