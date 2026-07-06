import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Largest Contentful Paint APIで最大コンテンツの描画時間を計測する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('largest-contentful-paint');
}
