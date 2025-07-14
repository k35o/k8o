import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt = '<dialog>要素を閉じるように要求するrequestClose';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('requestclose');

  return OgImage({
    title: blog.title,
  });
}
