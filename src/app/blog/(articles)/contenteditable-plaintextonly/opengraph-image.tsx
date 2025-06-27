import { getBlogContent } from '#api/blog';
import { BlogOgImage } from '@/app/blog/_components/og-image';

export const alt =
  'contenteditableな要素でテキストだけを編集可能にする';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('contenteditable-plaintextonly');

  return BlogOgImage({
    title: blog.title,
  });
}
