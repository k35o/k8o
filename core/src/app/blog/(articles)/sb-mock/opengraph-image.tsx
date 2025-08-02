import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt =
  'sb.mockでStorybookで利用するモジュールをモックしよう！';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('sb-mock');

  return OgImage({
    title: blog.title,
  });
}
