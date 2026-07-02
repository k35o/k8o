import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'Intl.DurationFormatで期間をlocaleに基づいて表現する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('intl-duration-format');
}
