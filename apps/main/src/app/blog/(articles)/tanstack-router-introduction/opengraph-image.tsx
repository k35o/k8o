import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('tanstack-router-introduction');
}
