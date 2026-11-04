import type { PlaygroundSection } from '@playgrounds/types';
import { prerender } from 'react-dom/static';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBlogContents } from '@/features/blog/interface/queries';

import { PlaygroundSectionView } from './playground-section-view';

vi.mock('@/features/blog/interface/queries', () => ({
  getBlogContents: vi.fn(),
}));
// 本物の href は Vite が置き換える import.meta.env.BASE_URL を読み、Node が直に読む node_modules では動かない
vi.mock('@k8ordo/framework', () => ({
  href: (pattern: string, params: Record<string, string> = {}): string =>
    pattern.replaceAll(/:(\w+)/gu, (_, name: string) => params[name] ?? ''),
}));

type BlogContent = Awaited<ReturnType<typeof getBlogContents>>[number];

const blog = (slug: string): BlogContent => ({
  id: 1,
  slug,
  tags: ['CSS'],
  title: '記事の題',
  description: '記事の説明。',
  createdAt: '2026-01-05',
  updatedAt: '2026-01-06',
  readingTime: 3,
});

const section = (
  kind: { type: 'blog'; slug: string } | { type: 'standalone' },
): PlaygroundSection => ({
  id: 'sample-demo',
  title: 'サンプルのデモ',
  description: 'デモの説明。',
  category: 'css',
  demos: [],
  ...kind,
});

const htmlOf = async (target: PlaygroundSection): Promise<string> => {
  const { prelude } = await prerender(
    <PlaygroundSectionView section={target} />,
  );
  return new Response(prelude).text();
};

describe('PlaygroundSectionView', () => {
  beforeEach(() => {
    vi.mocked(getBlogContents).mockResolvedValue([blog('sample-post')]);
  });

  describe('正常系', () => {
    it('解説の記事が公開済みなら、「ブログで解説を読む」から記事へリンクする', async () => {
      const html = await htmlOf(section({ type: 'blog', slug: 'sample-post' }));

      expect(html).toContain('href="/blog/sample-post"');
      expect(html).toContain('ブログで解説を読む');
    });
  });

  describe('エッジケース', () => {
    it('解説の記事がまだ公開されていなければ、記事へのボタンを出さない', async () => {
      const html = await htmlOf(
        section({ type: 'blog', slug: 'unpublished-post' }),
      );

      expect(html).not.toContain('href="/blog/');
      expect(html).not.toContain('ブログで解説を読む');
    });

    it('記事を持たない Playground には、記事へのボタンを出さない', async () => {
      const html = await htmlOf(section({ type: 'standalone' }));

      expect(html).not.toContain('ブログで解説を読む');
    });
  });
});
