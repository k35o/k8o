import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = ':open疑似クラスで開いている要素をまとめてスタイリングする';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('open-pseudo');
}
