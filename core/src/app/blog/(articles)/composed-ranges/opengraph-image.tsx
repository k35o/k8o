import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt =
  'SelectionでShadow DOMを跨いだ選択範囲を取得するgetComposedRanges';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('composed-ranges');

  return OgImage({
    title: blog.title,
  });
}
