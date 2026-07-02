import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Hono JSXで@storybook/react-viteと同じ使い心地を得るためのStorybookフレームワーク storybook-framework-hono-vite を作った';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('storybook-framework-hono-vite');
}
