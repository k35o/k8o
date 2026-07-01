import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'Atomicsで共有メモリ上のデータを安全に取り扱う';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('atomics-pause');
}
