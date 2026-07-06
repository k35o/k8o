import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'JavaScript modules in service workers';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('js-modules-service-workers');
}
