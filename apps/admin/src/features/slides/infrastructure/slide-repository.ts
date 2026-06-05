import { db } from '@repo/database';
import { desc, eq, inArray } from 'drizzle-orm';

export type SlideRecord = {
  id: number;
  slug: string;
  published: boolean;
  tags: string[];
};

export const findSlides = async (): Promise<SlideRecord[]> => {
  const slides = await db
    .select({
      id: db._schema.slides.id,
      slug: db._schema.slides.slug,
      published: db._schema.slides.published,
    })
    .from(db._schema.slides)
    .orderBy(desc(db._schema.slides.createdAt));

  if (slides.length === 0) {
    return [];
  }

  const ids = slides.map((s) => s.id);
  const tagRows = await db
    .select({
      slideId: db._schema.slideTag.slideId,
      name: db._schema.tags.name,
    })
    .from(db._schema.slideTag)
    .innerJoin(
      db._schema.tags,
      eq(db._schema.tags.id, db._schema.slideTag.tagId),
    )
    .where(inArray(db._schema.slideTag.slideId, ids));

  const tagMap = new Map<number, string[]>();
  for (const row of tagRows) {
    const list = tagMap.get(row.slideId) ?? [];
    list.push(row.name);
    tagMap.set(row.slideId, list);
  }

  return slides.map((s) => ({
    id: s.id,
    slug: s.slug,
    published: s.published,
    tags: tagMap.get(s.id) ?? [],
  }));
};

export const updateSlidePublished = async (
  id: number,
  published: boolean,
): Promise<void> => {
  await db
    .update(db._schema.slides)
    .set({ published })
    .where(eq(db._schema.slides.id, id));
};
