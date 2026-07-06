import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'font-family: mathで数式に適切なフォントを適用する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('font-family-math');
}
