import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'document.caretPositionFromPointで座標からキャレット位置を取得する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('document-caretpositionfrompoint');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
