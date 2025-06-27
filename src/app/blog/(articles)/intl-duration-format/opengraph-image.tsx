import { getBlogContent } from '#api/blog';
import { BlogOgImage } from '@/app/blog/_components/og-image';

export const alt =
  'Intl.DurationFormatで期間をlocaleに基づいて表現する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('intl-duration-format');

  return BlogOgImage({
    title: blog.title,
  });
}
