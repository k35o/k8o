import { db } from '@repo/database';
import { desc, eq, inArray } from 'drizzle-orm';

export type TalkRecord = {
  id: number;
  title: string;
  eventName: string;
  eventDate: string;
  eventLocation: string | null;
  eventUrl: string;
  slideUrl: string;
  blogSlug: string;
  tags: string[];
};

export type TalkInput = {
  title: string;
  eventUrl: string;
  eventName: string;
  eventDate: string;
  eventLocation: string | null;
  slideUrl: string;
  blogId: number;
};

export type BlogOption = {
  id: number;
  slug: string;
};

export const findTalks = async (): Promise<TalkRecord[]> => {
  const talks = await db
    .select({
      id: db._schema.talks.id,
      title: db._schema.talks.title,
      eventName: db._schema.talks.eventName,
      eventDate: db._schema.talks.eventDate,
      eventLocation: db._schema.talks.eventLocation,
      eventUrl: db._schema.talks.eventUrl,
      slideUrl: db._schema.talks.slideUrl,
      blogSlug: db._schema.blogs.slug,
    })
    .from(db._schema.talks)
    .innerJoin(
      db._schema.blogs,
      eq(db._schema.blogs.id, db._schema.talks.blogId),
    )
    .orderBy(desc(db._schema.talks.eventDate));

  if (talks.length === 0) {
    return [];
  }

  const ids = talks.map((t) => t.id);
  const tagRows = await db
    .select({ talkId: db._schema.talkTag.talkId, name: db._schema.tags.name })
    .from(db._schema.talkTag)
    .innerJoin(
      db._schema.tags,
      eq(db._schema.tags.id, db._schema.talkTag.tagId),
    )
    .where(inArray(db._schema.talkTag.talkId, ids));

  const tagMap = new Map<number, string[]>();
  for (const row of tagRows) {
    const list = tagMap.get(row.talkId) ?? [];
    list.push(row.name);
    tagMap.set(row.talkId, list);
  }

  return talks.map((talk) => ({
    id: talk.id,
    title: talk.title,
    eventName: talk.eventName,
    eventDate: talk.eventDate,
    eventLocation: talk.eventLocation,
    eventUrl: talk.eventUrl,
    slideUrl: talk.slideUrl,
    blogSlug: talk.blogSlug,
    tags: tagMap.get(talk.id) ?? [],
  }));
};

export const findTalkForEdit = (id: number) =>
  db.query.talks.findFirst({ where: eq(db._schema.talks.id, id) });

export const findBlogOptions = async (): Promise<BlogOption[]> => {
  const rows = await db
    .select({ id: db._schema.blogs.id, slug: db._schema.blogs.slug })
    .from(db._schema.blogs)
    .orderBy(db._schema.blogs.slug);
  return rows;
};

export const insertTalk = async (input: TalkInput): Promise<void> => {
  await db.insert(db._schema.talks).values(input);
};

export const updateTalkById = async (
  id: number,
  input: TalkInput,
): Promise<void> => {
  await db
    .update(db._schema.talks)
    .set(input)
    .where(eq(db._schema.talks.id, id));
};

// talk_tag は talkId にカスケード設定が無いため先に削除する。
export const deleteTalkById = async (id: number): Promise<void> => {
  await db.delete(db._schema.talkTag).where(eq(db._schema.talkTag.talkId, id));
  await db.delete(db._schema.talks).where(eq(db._schema.talks.id, id));
};
