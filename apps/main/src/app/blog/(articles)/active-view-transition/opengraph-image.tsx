import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  ':active-view-transition-type()で遷移タイプごとに異なるアニメーションを適用する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('active-view-transition');
}
