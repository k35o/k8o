import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  '特定のケースではsatisfies演算子で型が絞り込まれてしまう？？？';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('typescript-satisfies-narrowing');
}
