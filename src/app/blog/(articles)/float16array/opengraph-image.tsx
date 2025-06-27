import { getBlogContent } from '#api/blog';
import { BlogOgImage } from '@/app/blog/_components/og-image';

export const alt = '16bit浮動小数点が使える！Float16Array';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('float16array');

  return BlogOgImage({
    title: blog.title,
    description: blog.description,
    tags: blog.tags,
  });
}
