import { describe, expect, it, vi } from 'vitest';

import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';
import { findBlogContent } from '@/features/blog/interface/queries';

import { GET } from './route';

vi.mock('@/features/blog/interface/queries', () => ({
  findBlogContent: vi.fn(),
  getBlogContents: vi.fn(),
}));
vi.mock('@/app/blog/_components/blog-og-image', () => ({
  renderBlogOgImage: vi.fn(),
}));

const requestOgImage = (slug: string): Promise<Response> =>
  GET(new Request(`https://k8o.me/blog/${slug}/og.png`), {
    params: Promise.resolve({ slug }),
  });

describe('GET /blog/<slug>/og.png', () => {
  describe('正常系', () => {
    it('公開済みの記事は renderBlogOgImage の画像をそのまま返す', async () => {
      vi.mocked(findBlogContent).mockResolvedValue({
        id: 1,
        slug: 'blog-a',
        tags: [],
        slideUrl: undefined,
        title: 'タイトル',
        description: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      const image = new Response('png', {
        headers: { 'Content-Type': 'image/png' },
      });
      vi.mocked(renderBlogOgImage).mockResolvedValue(image);

      const res = await requestOgImage('blog-a');

      expect(res).toBe(image);
      expect(renderBlogOgImage).toHaveBeenCalledWith('blog-a');
    });
  });

  describe('異常系', () => {
    it('記事が無い slug は 404 を返し、OG を描きに行かない（描く側は MDX を先に読み、ENOENT で 500 になるため）', async () => {
      vi.mocked(findBlogContent).mockResolvedValue(null);

      const res = await requestOgImage('missing-blog');

      expect(res.status).toBe(404);
      expect(renderBlogOgImage).not.toHaveBeenCalled();
    });
  });
});
