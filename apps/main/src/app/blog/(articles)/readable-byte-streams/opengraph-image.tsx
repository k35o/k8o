import { OgImage } from '@/app/_components/og-image';
import {
  getBlogContent,
  getBlogOgCode,
} from '@/features/blog/interface/queries';

export const alt = 'Readable Byte Streams';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const [blog, ogCode] = await Promise.all([
    getBlogContent('readable-byte-streams'),
    getBlogOgCode('readable-byte-streams'),
  ]);

  return OgImage({
    category: 'Blog',
    title: blog.title,
    code: ogCode ?? undefined,
  });
}
