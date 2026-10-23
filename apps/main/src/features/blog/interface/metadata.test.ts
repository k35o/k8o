import { describe, expect, it, vi } from 'vitest';

import { buildBlogMetadata } from './metadata';
import { getBlogContent } from './queries';

vi.mock('./queries', () => ({
  getBlogContent: vi.fn(),
}));

const blog = {
  id: 1,
  slug: 'sample-post',
  tags: [
    { id: 1, name: 'CSS' },
    { id: 2, name: 'React' },
  ],
  slideUrl: undefined,
  title: 'サンプル記事',
  description: '記事の説明',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-02',
};

describe('buildBlogMetadata', () => {
  describe('正常系', () => {
    it('OG 画像は記事の og.png を、記事のタイトルを alt にして指す', async () => {
      vi.mocked(getBlogContent).mockResolvedValue(blog);

      const metadata = await buildBlogMetadata('sample-post');

      const image = {
        url: 'https://k8o.me/blog/sample-post/og.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'サンプル記事',
      };
      expect(metadata.openGraph?.images).toStrictEqual([image]);
      expect(metadata.twitter?.images).toStrictEqual([image]);
    });
  });
});
