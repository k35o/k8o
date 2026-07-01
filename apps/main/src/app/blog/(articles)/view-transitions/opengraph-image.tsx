import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Web上のさまざまな表現同士の遷移を簡単にアニメーション化するView Transition API';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('view-transitions');
}
