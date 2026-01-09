import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'print-color-adjustで印刷時の色調整を制御する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('print-color-adjust');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
