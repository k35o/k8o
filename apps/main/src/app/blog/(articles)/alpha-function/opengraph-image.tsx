import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'alpha()で色の不透明度だけを書き換える';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('alpha-function');
}
