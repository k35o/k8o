import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt =
  'Invoker Commands APIでJavaScriptなしでボタンから他の要素を操作する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const [blog, ogCode] = await Promise.all([
    getBlogContent('invoker-commands'),
    getBlogOgCode('invoker-commands'),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
}
