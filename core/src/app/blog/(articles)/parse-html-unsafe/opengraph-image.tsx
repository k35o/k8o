import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt = 'parseHtmlUnsafeでHTMLをDocumentに変換する';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('parse-html-unsafe');

  return OgImage({
    title: blog.title,
  });
}
