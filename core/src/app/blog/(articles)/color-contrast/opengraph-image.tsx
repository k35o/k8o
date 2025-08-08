import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt = '色のコントラスト比は重要だけどどうやって求めるんだっけ？';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('color-contrast');

  return OgImage({
    title: blog.title,
  });
}
