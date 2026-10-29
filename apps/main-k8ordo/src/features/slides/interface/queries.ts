import { notFound } from '@k8ordo/framework';

import { getSlides } from '@/features/slides/application/slides';
import { memoizeInBuild } from '@/shared/cache/memoize-in-build';

export const getSlideContents = memoizeInBuild(getSlides);

// slug で行を引かず、一覧・フィード・paths と同じ 1 つの一覧から引く。公開していないデッキと MDX の無いデッキは見つからない
export const findSlideContent = async (slug: string) =>
  (await getSlideContents()).find((content) => content.slug === slug);

export const getSlideContent = async (slug: string) => {
  const slide = await findSlideContent(slug);
  if (slide === undefined) {
    notFound();
  }
  return slide;
};
