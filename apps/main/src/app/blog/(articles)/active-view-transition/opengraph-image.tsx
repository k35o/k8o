import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  ':active-view-transition-type()で遷移タイプごとに異なるアニメーションを適用する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('active-view-transition');

  return await OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
