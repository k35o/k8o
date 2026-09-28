import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Name-only container queriesでコンテナの名前だけを条件にスタイルを当てる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('container-name-queries');
}
