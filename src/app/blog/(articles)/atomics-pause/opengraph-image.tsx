import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt = 'Atomicsで共有メモリ上のデータを安全に取り扱う';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('atomics-pause');

  return OgImage({
    title: blog.title,
  });
}
