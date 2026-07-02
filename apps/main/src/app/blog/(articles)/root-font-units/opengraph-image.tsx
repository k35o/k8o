import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'rcap, rch, rex, ric単位でルート要素に基づいたサイズを指定する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('root-font-units');
}
