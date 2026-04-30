import { db } from '@repo/database';
import { getBlogMetadata } from '@/features/blog/application/blog';

export async function getTag(id: number): Promise<{
  id: number;
  name: string;
  blogs: {
    id: number;
    slug: string;
    title: string;
  }[];
  talks: {
    id: number;
    title: string;
  }[];
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

  const blogs = await Promise.all(
    tag.blogTag
      .filter((blogTag) => blogTag.blog.published)
      .map(async (blogTag) => {
        const metadata = await getBlogMetadata(blogTag.blog.slug);
        return {
          id: blogTag.blog.id,
          slug: blogTag.blog.slug,
          title: metadata.title,
        };
      }),
  );

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
