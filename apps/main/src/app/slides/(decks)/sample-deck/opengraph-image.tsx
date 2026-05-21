import { OgImage } from '@/app/_components/og-image';
import { getSlideContent } from '@/features/slides/interface/queries';

export const alt = 'サンプルスライド';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const slide = await getSlideContent('sample-deck');
  return OgImage({
    category: 'Slides',
    title: slide.title,
  });
}
