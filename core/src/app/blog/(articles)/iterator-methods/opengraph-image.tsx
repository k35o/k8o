import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'Iteratorに対してmapやfilterのようなヘルパー関数を作用させる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('iterator-methods');

  return OgImage({
    title: blog.title,
  });
}
