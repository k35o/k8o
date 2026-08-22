import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'sibling-index()とsibling-count()で並び順をCSSの計算に持ち込む';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('sibling-count-index');
}
