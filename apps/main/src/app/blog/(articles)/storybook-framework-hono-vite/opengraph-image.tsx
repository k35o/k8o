import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'Hono JSXで@storybook/react-viteと同じ使い心地を得るためのStorybookフレームワーク storybook-framework-hono-vite を作った';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('storybook-framework-hono-vite');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
