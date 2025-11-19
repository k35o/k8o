import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'Shadow DOM境界を跨いだ選択範囲の処理を可能にするgetComposedRanges';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('composed-ranges');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
