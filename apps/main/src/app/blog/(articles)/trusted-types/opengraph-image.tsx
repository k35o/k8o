import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt = 'Trusted Types';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('trusted-types');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
