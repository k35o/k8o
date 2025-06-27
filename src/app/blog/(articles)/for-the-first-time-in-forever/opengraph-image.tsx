import { getBlogContent } from '#api/blog';
import { BlogOgImage } from '@/app/blog/_components/og-image';

export const alt = '【TSKaigi】初めて登壇しました！';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('for-the-first-time-in-forever');

  return BlogOgImage({
    title: blog.title,
  });
}
