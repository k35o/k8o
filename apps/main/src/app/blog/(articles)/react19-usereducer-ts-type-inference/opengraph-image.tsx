import { renderBlogOgImage } from '@/app/blog/_components/blog-og-image';

export const alt = 'React19で変化したuseReducerの型から学ぶTypeScriptの型推論';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return renderBlogOgImage('react19-usereducer-ts-type-inference');
}
