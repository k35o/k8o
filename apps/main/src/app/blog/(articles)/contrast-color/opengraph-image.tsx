import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'contrast-color()で背景色に応じた読みやすい文字色を自動で割り当てる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('contrast-color');
}
