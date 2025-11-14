import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'Atomics.waitAsyncで非同期に共有メモリ上のデータを待機する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('atomics-wait-async');

  return OgImage({
    title: blog.title,
  });
}
