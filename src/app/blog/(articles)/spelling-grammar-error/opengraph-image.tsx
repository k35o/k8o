import { getBlogContent } from '#api/blog';
import { BlogOgImage } from '@/app/blog/_components/og-image';

export const alt = '::spelling-errorと::grammar-error';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('spelling-grammar-error');

  return BlogOgImage({
    title: blog.title,
  });
}
