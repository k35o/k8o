import { getBlogContent } from '#api/blog';
import { OgImage } from '@/app/_components/og-image';

export const alt =
  'React19で変化したuseReducerの型から学ぶTypeScriptの型推論';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent(
    'react19-usereducer-ts-type-inference',
  );

  return OgImage({
    title: blog.title,
  });
}
