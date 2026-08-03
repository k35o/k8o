import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  '数値の精度を失わずにJSONを読み書きするJSON source text access';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('json-raw');
}
