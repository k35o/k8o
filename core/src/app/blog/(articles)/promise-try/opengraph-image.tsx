import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt =
  '関数の同期・非同期を気にせず処理するPromise.tryとは';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('promise-try');

  return OgImage({
    title: blog.title,
  });
}
