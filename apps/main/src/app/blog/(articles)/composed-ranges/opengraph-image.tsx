import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Shadow DOM境界を跨いだ選択範囲の処理を可能にするgetComposedRanges';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('composed-ranges');
}
