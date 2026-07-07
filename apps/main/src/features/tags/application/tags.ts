import { db } from '@repo/database';

export async function getTags(): Promise<
  Array<{
    id: number;
    name: string;
    blogCount: number;
    talkCount: number;
  }>
> {
  const tags = await db.query.tags.findMany({
    columns: {
      id: true,
      name: true,
    },
    with: {
      blogTag: {
        with: {
          blog: true,
        },
      },
      talkTag: {
        with: {
          talk: true,
        },
      },
    },
    orderBy: (fields, { asc }) => asc(fields.name),
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    blogCount: tag.blogTag.filter((blogTag) => blogTag.blog.published).length,
    talkCount: tag.talkTag.length,
  }));
}
