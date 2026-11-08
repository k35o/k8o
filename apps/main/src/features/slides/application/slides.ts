import { getPublishedSlides } from '@repo/api/build-data';

import { findSlideMetadata } from './slide';

// 公開済みで MDX のあるデッキを、api の一覧の並び（新しい順）のまま返す。題・説明・日付は MDX から足す
export const getSlides = async () => {
  const slides = await Promise.all(
    (await getPublishedSlides()).map(async (slide) => {
      const metadata = await findSlideMetadata(slide.slug);
      if (metadata === null) {
        return null;
      }
      return {
        id: slide.id,
        slug: slide.slug,
        tags: slide.tags,
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      };
    }),
  );
  return slides.filter((slide) => slide !== null);
};
