import { db } from '@repo/database';

export const findPublishedBlogRows = () =>
  db.query.blogs.findMany({
    columns: { id: true, slug: true },
    where: (blog, { eq }) => eq(blog.published, true),
    with: {
      blogTag: { with: { tag: { columns: { id: true, name: true } } } },
      talks: { columns: { slideUrl: true } },
    },
    orderBy: (blog, { desc }) => [desc(blog.createdAt), desc(blog.id)],
  });

export const findPublishedSlideRows = () =>
  db.query.slides.findMany({
    columns: { id: true, slug: true },
    where: (slide, { eq }) => eq(slide.published, true),
    with: {
      slideTag: { with: { tag: { columns: { name: true } } } },
    },
    orderBy: (slide, { desc }) => [desc(slide.createdAt), desc(slide.id)],
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
      blog: { columns: { id: true, slug: true } },
      talkTag: { with: { tag: { columns: { id: true, name: true } } } },
    },
  });
