import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt =
  'Hono JSXで@storybook/react-viteと同じ使い心地を得るためのStorybookフレームワーク storybook-framework-hono-vite を作った';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const [blog, ogCode] = await Promise.all([
    getBlogContent('storybook-framework-hono-vite'),
    getBlogOgCode('storybook-framework-hono-vite'),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
}
