import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt = ':open疑似クラスで開いている要素をまとめてスタイリングする';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const [blog, ogCode] = await Promise.all([
    getBlogContent('open-pseudo'),
    getBlogOgCode('open-pseudo'),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
}
