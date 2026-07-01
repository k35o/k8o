import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = '色のコントラスト比は重要だけどどうやって求めるんだっけ？';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('color-contrast');
}
