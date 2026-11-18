import {
  findPublishedBlogRows,
  findTagRows,
  findTalkRows,
} from '../infrastructure/site-content-repository';

type TagRef = { id: number; name: string };

export type PublishedBlog = {
  id: number;
  slug: string;
  tags: TagRef[];
  // 記事を解説に持つトークの、k8o.me のデッキの名前と外のスライドの URL
  talk: { slug: string | null; slideUrl: string | null } | null;
};

export type Tag = {
  id: number;
  name: string;
  blogIds: number[];
  talkIds: number[];
};

export type Talk = {
  id: number;
  title: string;
  slug: string | null;
  eventUrl: string;
  eventName: string;
  eventDate: string;
  eventLocation: string | null;
  slideUrl: string | null;
  blog: { id: number; slug: string } | null;
  tags: TagRef[];
};

// 新しい順。題・説明・日付は main の MDX にあるので、DB にあるものだけを返す
export const getPublishedBlogs = async (): Promise<PublishedBlog[]> =>
  (await findPublishedBlogRows()).map((row) => ({
    id: row.id,
    slug: row.slug,
    tags: row.blogTag.map(({ tag }) => tag),
    talk: row.talks[0] ?? null,
  }));

export const getTags = async (): Promise<Tag[]> =>
  (await findTagRows()).map((row) => ({
    id: row.id,
    name: row.name,
    blogIds: row.blogTag
      .filter(({ blog }) => blog.published)
      .map(({ blog }) => blog.id),
    talkIds: row.talkTag.map(({ talkId }) => talkId),
  }));

export const getTalks = async (): Promise<Talk[]> =>
  (await findTalkRows()).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    eventUrl: row.eventUrl,
    eventName: row.eventName,
    eventDate: row.eventDate,
    eventLocation: row.eventLocation,
    slideUrl: row.slideUrl,
    blog: row.blog,
    tags: row.talkTag.map(({ tag }) => tag),
  }));
