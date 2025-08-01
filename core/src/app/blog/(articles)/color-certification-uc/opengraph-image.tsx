import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt = '色彩検定UC級に合格しました！';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('color-certification-uc');

  return OgImage({
    title: blog.title,
  });
}
