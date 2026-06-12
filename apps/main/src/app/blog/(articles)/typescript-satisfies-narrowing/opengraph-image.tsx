import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt =
  '特定のケースではsatisfies演算子で型が絞り込まれてしまう？？？';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const [blog, ogCode] = await Promise.all([
    getBlogContent('typescript-satisfies-narrowing'),
    getBlogOgCode('typescript-satisfies-narrowing'),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
}
