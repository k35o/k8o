import { getBlogContent } from '#api/blog';
import { BlogOgImage } from '@/app/blog/_components/og-image';

export const alt = '任意のデータをコピー&ペーストするClipboard API';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('async-clipboard');

  return BlogOgImage({
    title: blog.title,
  });
}
