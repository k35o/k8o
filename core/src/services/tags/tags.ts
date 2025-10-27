import { db } from '@/database/db';

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
    blogCount: tag.blogTag.filter((blogTag) => blogTag.blog.published).length,
    serviceCount: tag.serviceTag.length,
    talkCount: tag.talkTag.length,
  }));
};
