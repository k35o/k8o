import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'CSS グラデーションの新仕様：単色カラーストップの導入';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('single-color-gradients');
}
