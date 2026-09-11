import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'progress()で値が2つの境界のどこにあるかを比率で取り出す';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('progress-function');
}
