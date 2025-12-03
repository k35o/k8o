import { db } from '@repo/database';

export async function getTalks() {
  'use cache';
  const talks = await db.query.talks.findMany({
    with: {
      blog: true,
      talkTag: {
        with: {
          tag: true,
        },
      },
    },
  });

  return talks.map((talk) => ({
    id: talk.id,
    title: talk.title,
    eventUrl: talk.eventUrl,
    eventName: talk.eventName,
    eventDate: talk.eventDate,
    eventLocation: talk.eventLocation,
    slideUrl: talk.slideUrl,
    blogId: talk.blogId,
    blog: {
      id: talk.blog.id,
      slug: talk.blog.slug,
    },
    tags: talk.talkTag.map((tag) => ({
      id: tag.tag.id,
      name: tag.tag.name,
    })),
  }));
}
