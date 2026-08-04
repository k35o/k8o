import { db } from '@repo/database';

import { findBlogMetadata } from '@/features/blog/application/blog';

export async function getTag(id: number): Promise<{
  id: number;
  name: string;
  blogs: Array<{
    id: number;
    slug: string;
    title: string;
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

  const blogs = (
    await Promise.all(
      tag.blogTag
        .filter((blogTag) => blogTag.blog.published)
        .map(async (blogTag) => {
          const metadata = await findBlogMetadata(blogTag.blog.slug);
          if (metadata === null) return null;
          return {
            id: blogTag.blog.id,
            slug: blogTag.blog.slug,
            title: metadata.title,
          };
        }),
    )
  ).filter((blog) => blog !== null);

  return {
    id: tag.id,
    name: tag.name,
    blogs,
    talks: tag.talkTag.map((talkTag) => ({
      id: talkTag.talk.id,
      title: talkTag.talk.title,
    })),
  };
}
