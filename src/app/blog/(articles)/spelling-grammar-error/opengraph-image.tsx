import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt =
  'スペルミス・文法エラーに対してスタイルを設定する::spelling-errorと::grammar-error';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('spelling-grammar-error');

  return OgImage({
    title: blog.title,
  });
}
