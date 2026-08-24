import { db } from '@repo/database';

export async function getTag(id: number): Promise<{
  id: number;
  name: string;
  blogs: Array<{
    id: number;
    slug: string;
  }>;
  talks: Array<{
    id: number;
    title: string;
  }>;
} | null> {
  const tag = await db.query.tags.findFirst({
    where: (tags, { eq }) => eq(tags.id, id),
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
  });

  if (!tag) {
    return null;
  }

  return {
    id: tag.id,
    name: tag.name,
    blogs: tag.blogTag
      .filter((blogTag) => blogTag.blog.published)
      .map((blogTag) => ({
        id: blogTag.blog.id,
        slug: blogTag.blog.slug,
      })),
    talks: tag.talkTag.map((talkTag) => ({
      id: talkTag.talk.id,
      title: talkTag.talk.title,
    })),
  };
}
