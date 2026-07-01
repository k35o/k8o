import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'スペルミス・文法エラーに対してスタイルを設定する::spelling-errorと::grammar-error';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('spelling-grammar-error');
}
