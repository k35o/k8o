import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt =
  'CSS Custom Highlight APIで任意の範囲のテキストをハイライトする';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('highlight');

  return OgImage({
    title: blog.title,
  });
}
