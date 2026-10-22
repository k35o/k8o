import { describe, expect, it, vi } from 'vitest';

import {
  findBlogMarkdown,
  isPublishedBlog,
} from '@/features/blog/interface/queries';

import { GET } from './route';

vi.mock('@/features/blog/interface/queries', () => ({
  findBlogMarkdown: vi.fn(),
  isPublishedBlog: vi.fn(),
}));

const requestMarkdown = (slug: string): Promise<Response> =>
  GET(new Request(`https://k8o.me/blog/${slug}.md`), {
    params: Promise.resolve({ slug }),
  });

const cdnStaleSeconds = (res: Response): number => {
  const cacheControl = res.headers.get('Cache-Control') ?? '';
  const seconds = (directive: string): number =>
    Number(new RegExp(`${directive}=(\\d+)`, 'u').exec(cacheControl)?.[1] ?? 0);
  return seconds('s-maxage') + seconds('stale-while-revalidate');
};

describe('GET /blog/<slug>.md', () => {
  describe('正常系', () => {
    it('公開済みの記事は本文を markdown で返す', async () => {
      vi.mocked(isPublishedBlog).mockResolvedValue(true);
      vi.mocked(findBlogMarkdown).mockResolvedValue('# タイトル\n\n本文');

      const res = await requestMarkdown('blog-a');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe(
        'text/markdown; charset=utf-8',
      );
      await expect(res.text()).resolves.toBe('# タイトル\n\n本文');
    });

    it('CDN に置くのは s-maxage と stale-while-revalidate を合わせて10分まで（非公開に戻した記事の本文を長く残さないため）', async () => {
      vi.mocked(isPublishedBlog).mockResolvedValue(true);
      vi.mocked(findBlogMarkdown).mockResolvedValue('# タイトル\n\n本文');

      const res = await requestMarkdown('blog-a');

      expect(cdnStaleSeconds(res)).toBeLessThanOrEqual(600);
    });
  });

  describe('異常系', () => {
    it('MDX がある下書きの記事は 404 を返し、本文を出さない', async () => {
      vi.mocked(isPublishedBlog).mockResolvedValue(false);
      vi.mocked(findBlogMarkdown).mockResolvedValue('# 下書き\n\n未公開の本文');

      const res = await requestMarkdown('draft-blog');

      expect(res.status).toBe(404);
      await expect(res.text()).resolves.not.toContain('未公開の本文');
    });

    it('公開済みでも MDX が無い記事は 404 を返す', async () => {
      vi.mocked(isPublishedBlog).mockResolvedValue(true);
      vi.mocked(findBlogMarkdown).mockResolvedValue(null);

      const res = await requestMarkdown('missing-blog');

      expect(res.status).toBe(404);
    });

    it('公開状態を読めないときは 404 にせず失敗させる（api が記事なしと取り違えないため）', async () => {
      vi.mocked(isPublishedBlog).mockRejectedValue(
        new Error('DB に繋がらない'),
      );

      await expect(requestMarkdown('blog-a')).rejects.toThrow(
        'DB に繋がらない',
      );
    });
  });
});
