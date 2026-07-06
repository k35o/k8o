import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt =
  'Invoker Commands APIでJavaScriptなしでボタンから他の要素を操作する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('invoker-commands');
}
