import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt = '画面のスリープを防ぐScreen Wake Lock API';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('screen-wake-lock');

  return OgImage({
    title: blog.title,
  });
}
