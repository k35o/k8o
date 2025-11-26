import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'CSS グラデーションの新仕様：単色カラーストップの導入';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('single-color-gradients');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
