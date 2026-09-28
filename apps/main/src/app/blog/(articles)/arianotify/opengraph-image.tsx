import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('arianotify');
}
