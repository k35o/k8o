import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'WebTransportでHTTP/3上の双方向通信を実現する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('webtransport');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
