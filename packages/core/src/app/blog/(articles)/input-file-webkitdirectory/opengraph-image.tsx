import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'ファイルを受け入れるinput要素でディレクトリを扱うwebkitdirectory属性';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('input-file-webkitdirectory');

  return OgImage({
    title: blog.title,
  });
}
