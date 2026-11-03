import { findTalkRows } from '../infrastructure/talk-repository';

export async function getTalks() {
  const talks = await findTalkRows();

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
