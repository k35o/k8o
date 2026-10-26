import { describe, expect, it, vi } from 'vitest';

import { renderBlogOgImage } from '@/components/blog/blog-og-image/blog-og-image';
import {
  findBlogContent,
  findBlogMarkdown,
  isPublishedBlog,
} from '@/features/blog/interface/queries';

import { GET as getArticleMarkdown } from '../routes/blog/[slug]/article.md/route';
import { GET as getOgImage } from '../routes/blog/[slug]/og.png/route';

vi.mock('@/features/blog/interface/queries', () => ({
  findBlogContent: vi.fn(),
  findBlogMarkdown: vi.fn(),
  isPublishedBlog: vi.fn(),
}));
vi.mock('@/components/blog/blog-og-image/blog-og-image', () => ({
  renderBlogOgImage: vi.fn(),
}));

const requestMarkdown = async (slug: string): Promise<Response> =>
  getArticleMarkdown({
    request: new Request(`http://k8ordo.localhost/blog/${slug}/article.md`),
    params: { slug },
  });

const requestOgImage = async (slug: string): Promise<Response> =>
  getOgImage({
    request: new Request(`http://k8ordo.localhost/blog/${slug}/og.png`),
    params: { slug },
  });

describe('GET /blog/:slug/article.md', () => {
  describe('正常系', () => {
    it('公開済みの記事は本文を、型を書いた markdown で返す', async () => {
      vi.mocked(isPublishedBlog).mockResolvedValue(true);
      vi.mocked(findBlogMarkdown).mockResolvedValue('# タイトル\n\n本文');

      const res = await requestMarkdown('blog-a');

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe(
        'text/markdown; charset=utf-8',
      );
      await expect(res.text()).resolves.toBe('# タイトル\n\n本文');
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

    it('公開状態を読めないときは 404 にせず失敗させる（ビルドを止める）', async () => {
      vi.mocked(isPublishedBlog).mockRejectedValue(
        new Error('DB に繋がらない'),
      );

      await expect(requestMarkdown('blog-a')).rejects.toThrow(
        'DB に繋がらない',
      );
    });
  });
});

describe('GET /blog/:slug/og.png', () => {
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
    it('記事が無い slug は 404 を返し、OG を描きに行かない（描く側は MDX を先に読み、ENOENT で落ちるため）', async () => {
      vi.mocked(findBlogContent).mockResolvedValue(null);

      const res = await requestOgImage('missing-blog');

      expect(res.status).toBe(404);
      expect(renderBlogOgImage).not.toHaveBeenCalled();
    });
  });
});
