import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'スペルミス・文法エラーに対してスタイルを設定する::spelling-errorと::grammar-error';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('spelling-grammar-error');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
