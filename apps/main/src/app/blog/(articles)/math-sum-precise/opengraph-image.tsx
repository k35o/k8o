import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'Math.sumPrecise()';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('math-sum-precise');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
