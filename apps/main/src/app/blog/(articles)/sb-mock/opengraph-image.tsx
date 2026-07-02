import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'sb.mockでStorybookで利用するモジュールをモックしよう！';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('sb-mock');
}
