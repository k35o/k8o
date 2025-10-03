import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/app/blog/_api';

export const alt = 'contenteditableな要素でテキストだけを編集可能にする';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('contenteditable-plaintextonly');

  return OgImage({
    title: blog.title,
  });
}
