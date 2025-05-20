import { db } from '#database/db';
import { getBlogMetadata } from '#services/blog';

export const getTags = async (
  page = 1,
): Promise<
  {
    id: number;
    name: string;
    blogCount: number;
    serviceCount: number;
    talkCount: number;
  }[]
> => {
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
      serviceTag: {
        with: {
          service: true,
        },
      },
      talkTag: {
        with: {
          talk: true,
        },
      },
    },
    limit: 100,
    offset: (page - 1) * 100,
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    blogCount: tag.blogTag.filter((blogTag) => blogTag.blog.published)
      .length,
    serviceCount: tag.serviceTag.length,
    talkCount: tag.talkTag.length,
  }));
};

export const getTag = async (
  id: number,
): Promise<{
  id: number;
  name: string;
  blogs: {
    id: number;
    slug: string;
    title: string;
  }[];
  services: {
    id: number;
    slug: string;
    title: string;
  }[];
  talks: {
    id: number;
    title: string;
  }[];
} | null> => {
  const tag = await db.query.tags.findFirst({
    where: (tags, { eq }) => eq(tags.id, id),
    with: {
      blogTag: {
        with: {
          blog: true,
        },
      },
      serviceTag: {
        with: {
          service: true,
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
    services: tag.serviceTag.map((serviceTag) => ({
      id: serviceTag.service.id,
      slug: serviceTag.service.slug,
      title: serviceTag.service.name,
    })),
    talks: tag.talkTag.map((talkTag) => ({
      id: talkTag.talk.id,
      title: talkTag.talk.title,
    })),
  };
};
