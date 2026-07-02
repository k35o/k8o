import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'URLのパターンマッチを簡単にするURLPattern API';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('urlpattern');
}
