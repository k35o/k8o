import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt =
  'Web上のさまざまな表現同士の遷移を簡単にアニメーション化するView Transition API';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('view-transitions');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
