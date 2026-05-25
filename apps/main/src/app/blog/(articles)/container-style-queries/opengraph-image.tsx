import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt =
  'Container style queriesでカスタムプロパティの値からスタイルを切り替える';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('container-style-queries');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
