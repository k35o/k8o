import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'WebTransportでHTTP/3上の双方向通信を実現する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('webtransport');
}
