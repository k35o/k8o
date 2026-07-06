import { cacheLife, cacheTag } from 'next/cache';

import {
  getSlide,
  getSlideMetadata,
} from '@/features/slides/application/slide';
import { getSlides } from '@/features/slides/application/slides';
import { DB_CONTENT_CACHE_TAG } from '@/shared/cache/cache-tags';

export async function getSlideContents() {
  'use cache';
  cacheLife('max');
  cacheTag(DB_CONTENT_CACHE_TAG);

  const slides = await getSlides();
  return Promise.all(
    slides.map(async (slide) => {
      const metadata = await getSlideMetadata(slide.slug);
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
