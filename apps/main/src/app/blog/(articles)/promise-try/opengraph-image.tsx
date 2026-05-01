import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = '関数の同期・非同期を気にせず処理するPromise.tryとは';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('promise-try');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
