import { db } from '@repo/database';

export const findPublishedBlogRows = () =>
  db.query.blogs.findMany({
    columns: { id: true, slug: true },
    where: (blog, { eq }) => eq(blog.published, true),
    with: {
      blogTag: { with: { tag: { columns: { id: true, name: true } } } },
    },
    orderBy: (blog, { desc }) => [desc(blog.createdAt), desc(blog.id)],
  });

export const findTagRows = () =>
  db.query.tags.findMany({
    columns: { id: true, name: true },
    with: {
      blogTag: {
        with: { blog: { columns: { id: true, published: true } } },
      },
      talkTag: { columns: { talkId: true } },
    },
    orderBy: (tag, { asc }) => asc(tag.name),
  });

export const findTalkRows = () =>
  db.query.talks.findMany({
    with: {
      blog: { columns: { id: true, slug: true, published: true } },
      talkTag: { with: { tag: { columns: { id: true, name: true } } } },
    },
    orderBy: (talk, { desc }) => [desc(talk.eventDate), desc(talk.id)],
  });
