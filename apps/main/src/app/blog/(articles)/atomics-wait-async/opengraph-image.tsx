import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'Atomics.waitAsyncで非同期に共有メモリ上のデータを待機する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('atomics-wait-async');
}
