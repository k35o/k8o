import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'Chrome138・Edge138でBaseline2025入りしたCSS abs()とsign()関数';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('abs-sign');

  return OgImage({
    title: blog.title,
  });
}
