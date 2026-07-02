import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'contenteditableな要素でテキストだけを編集可能にする';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('contenteditable-plaintextonly');
}
