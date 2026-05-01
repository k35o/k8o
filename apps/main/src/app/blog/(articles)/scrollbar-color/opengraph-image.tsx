import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'scrollbar-colorでスクロールバーの色を変更する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('scrollbar-color');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
