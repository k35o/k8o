import { OgImage } from '@/app/_components/og-image';
import { getBlogContent } from '@/features/blog/interface/queries';

export const alt = 'ChromaticにStorybookをPublishすることで広がる恩恵';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const blog = await getBlogContent('chromatic-storybook-publish');

  return OgImage({
    category: 'Blog',
    title: blog.title,
  });
}
