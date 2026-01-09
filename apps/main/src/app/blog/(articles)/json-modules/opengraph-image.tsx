import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'withキーワードを使用したJSONモジュールのインポート';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('json-modules');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
