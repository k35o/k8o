import { db } from '@repo/database';
import { count, eq } from 'drizzle-orm';

export type TagWithUsage = {
  id: number;
  name: string;
  blogCount: number;
  talkCount: number;
  slideCount: number;
  total: number;
};

export const findTagsWithUsage = async (): Promise<TagWithUsage[]> => {
  const [tags, blogCounts, talkCounts, slideCounts] = await Promise.all([
    db
      .select({ id: db._schema.tags.id, name: db._schema.tags.name })
      .from(db._schema.tags)
      .orderBy(db._schema.tags.name),
    db
      .select({ tagId: db._schema.blogTag.tagId, value: count() })
      .from(db._schema.blogTag)
      .groupBy(db._schema.blogTag.tagId),
    db
      .select({ tagId: db._schema.talkTag.tagId, value: count() })
      .from(db._schema.talkTag)
      .groupBy(db._schema.talkTag.tagId),
    db
      .select({ tagId: db._schema.slideTag.tagId, value: count() })
      .from(db._schema.slideTag)
      .groupBy(db._schema.slideTag.tagId),
  ]);

  const blogMap = new Map(blogCounts.map((c) => [c.tagId, c.value]));
  const talkMap = new Map(talkCounts.map((c) => [c.tagId, c.value]));
  const slideMap = new Map(slideCounts.map((c) => [c.tagId, c.value]));

  return tags.map((tag) => {
    const blogCount = blogMap.get(tag.id) ?? 0;
    const talkCount = talkMap.get(tag.id) ?? 0;
    const slideCount = slideMap.get(tag.id) ?? 0;
    return {
      id: tag.id,
      name: tag.name,
      blogCount,
      talkCount,
      slideCount,
      total: blogCount + talkCount + slideCount,
    };
  });
};

export const insertTag = async (name: string): Promise<void> => {
  await db.insert(db._schema.tags).values({ name });
};

export const updateTagName = async (
  id: number,
  name: string,
): Promise<void> => {
  await db
    .update(db._schema.tags)
    .set({ name })
    .where(eq(db._schema.tags.id, id));
};

export const countTagUsage = async (id: number): Promise<number> => {
  const [blog, talk, slide] = await Promise.all([
    db
      .select({ value: count() })
      .from(db._schema.blogTag)
      .where(eq(db._schema.blogTag.tagId, id))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(db._schema.talkTag)
      .where(eq(db._schema.talkTag.tagId, id))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ value: count() })
      .from(db._schema.slideTag)
      .where(eq(db._schema.slideTag.tagId, id))
      .then((r) => r[0]?.value ?? 0),
  ]);
  return blog + talk + slide;
};

export const deleteTagById = async (id: number): Promise<void> => {
  await db.delete(db._schema.tags).where(eq(db._schema.tags.id, id));
};
