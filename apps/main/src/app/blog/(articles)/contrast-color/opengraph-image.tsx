import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt =
  'contrast-color()で背景色に応じた読みやすい文字色を自動で割り当てる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('contrast-color');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
