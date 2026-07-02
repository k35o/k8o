import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = '関数の同期・非同期を気にせず処理するPromise.tryとは';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('promise-try');
}
