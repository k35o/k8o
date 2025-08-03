import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'Intl.DurationFormatで期間をlocaleに基づいて表現する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('intl-duration-format');

  return OgImage({
    title: blog.title,
  });
}
