import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Popover APIを使ってJavaScriptなしでツールチップやドロップダウンメニューを実装する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('popover');
}
