import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'Uint8Arrayとbase64、Hex（16進数）の相互変換';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('uint8array-base64-hex');
}
