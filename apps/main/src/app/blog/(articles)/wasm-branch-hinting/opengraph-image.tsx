import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt = 'WebAssemblyのBranch Hintingで分岐予測を助ける';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('wasm-branch-hinting');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
