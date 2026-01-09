import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = '【TSKaigi】初めて登壇しました！';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('for-the-first-time-in-forever');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
