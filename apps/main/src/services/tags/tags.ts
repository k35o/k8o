import { db } from '@repo/database';
import { cacheLife } from 'next/cache';

export async function getTags(page = 1): Promise<
  {
    id: number;
    name: string;
    blogCount: number;
    talkCount: number;
  }[]
> {
  'use cache';
  cacheLife('max');
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
    limit: 100,
    offset: (page - 1) * 100,
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    blogCount: tag.blogTag.filter((blogTag) => blogTag.blog.published).length,
    talkCount: tag.talkTag.length,
  }));
}
