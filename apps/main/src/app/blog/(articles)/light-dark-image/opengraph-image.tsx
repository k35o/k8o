import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'light-dark()でカラースキームに応じて画像を切り替える';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('light-dark-image');
}
