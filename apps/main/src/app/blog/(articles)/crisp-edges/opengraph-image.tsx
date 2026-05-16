import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt = 'image-rendering: crisp-edges';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('crisp-edges');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
