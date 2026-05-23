import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt = ':open疑似クラスで開いている要素をまとめてスタイリングする';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('open-pseudo');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
