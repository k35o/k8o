import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt = 'Readable Byte Streams';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('readable-byte-streams');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
