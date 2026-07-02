import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'text-decoration-skip-ink: all';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('text-decoration-skip-ink-all');
}
