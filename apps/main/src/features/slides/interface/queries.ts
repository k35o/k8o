import { DB_CONTENT_CACHE_TAG } from '@repo/helpers/cache/main-cache-tags';
import { cacheLife, cacheTag } from 'next/cache';

import {
  findSlideMetadata,
  getSlide,
  getSlideMetadata,
} from '@/features/slides/application/slide';
import { getSlides } from '@/features/slides/application/slides';

export async function getSlideContents() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const slides = await getSlides();
  const contents = await Promise.all(
    slides.map(async (slide) => {
      const metadata = await findSlideMetadata(slide.slug);
      if (metadata === null) return null;
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
  return contents.filter((content) => content !== null);
}

export async function getSlideContent(slug: string) {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const slide = await getSlide(slug);
  const metadata = await getSlideMetadata(slug);

  return {
    id: slide.id,
    slug: slide.slug,
    tags: slide.tags,
    title: metadata.title,
    description: metadata.description,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}
