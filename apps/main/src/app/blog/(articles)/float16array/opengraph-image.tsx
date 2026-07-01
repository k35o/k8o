import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = '16bit浮動小数点が使える！Float16Array';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('float16array');
}
