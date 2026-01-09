import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'CSSのabs()とsign()関数で数値の符号を使ったスタイリングを行う';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('abs-sign');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
