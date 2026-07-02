import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = '【TSKaigi】初めて登壇しました！';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('for-the-first-time-in-forever');
}
