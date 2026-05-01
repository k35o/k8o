import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = '画面のスリープを防ぐScreen Wake Lock API';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('screen-wake-lock');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
