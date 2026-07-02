import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'CSSのabs()とsign()関数で数値の符号を使ったスタイリングを行う';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('abs-sign');
}
