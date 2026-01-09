import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'Performance Event Timing APIで操作の待ち時間を計測する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('event-timing');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
