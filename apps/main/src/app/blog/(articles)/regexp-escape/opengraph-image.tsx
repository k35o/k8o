import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = '文字列に潜む正規表現の構文を置き換えるRegExp.escape';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('regexp-escape');
}
