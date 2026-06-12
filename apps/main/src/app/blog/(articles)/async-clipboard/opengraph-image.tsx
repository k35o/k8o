import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt = '任意のデータをコピー&ペーストするClipboard API';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const [blog, ogCode] = await Promise.all([
    getBlogContent('async-clipboard'),
    getBlogOgCode('async-clipboard'),
  ]);

  return OgImage({
    title: blog.title,
    category: 'Blog',
    code: ogCode ?? undefined,
  });
}
