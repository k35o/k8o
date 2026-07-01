import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'Performance Event Timing APIで操作の待ち時間を計測する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('event-timing');
}
