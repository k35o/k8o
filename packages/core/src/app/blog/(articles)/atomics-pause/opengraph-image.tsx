import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'Atomicsで共有メモリ上のデータを安全に取り扱う';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('atomics-pause');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
