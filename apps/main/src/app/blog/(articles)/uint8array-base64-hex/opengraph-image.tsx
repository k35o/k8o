import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'Uint8Arrayとbase64、Hex（16進数）の相互変換';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('uint8array-base64-hex');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
