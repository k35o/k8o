import { getBlogContent } from '#api/blog';
import { BlogOgImage } from '@/app/blog/_components/og-image';

export const alt =
  '文字列に潜む正規表現の構文を置き換えるRegExp.escape';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('regexp-escape');

  return BlogOgImage({
    title: blog.title,
    description: blog.description,
    tags: blog.tags,
  });
}
