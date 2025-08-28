import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'React SuspenseListでローディング順序を制御する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('suspense-list');

  return OgImage({
    title: blog.title,
  });
}
