import {
  findPublishedBlogRows,
  findTagRows,
  findTalkRows,
} from '../infrastructure/site-content-repository';
import { publishedDeckSlug } from './deck-publication';

type TagRef = { id: number; name: string };

export type PublishedBlog = {
  id: number;
  slug: string;
  tags: TagRef[];
  // 記事を解説に持つトークの、k8o.me のデッキの名前
  talk: { slug: string | null } | null;
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

// 公開時刻より前のデッキの slug は返さない。ビルドがデッキを取り込まず、トークは k8o.me のデッキを持たないものとして出る
export const getTalks = async (now: Date = new Date()): Promise<Talk[]> =>
  (await findTalkRows()).map((row) => ({
    id: row.id,
    title: row.title,
    slug: publishedDeckSlug(row, now),
    eventUrl: row.eventUrl,
    eventName: row.eventName,
    eventDate: row.eventDate,
    eventLocation: row.eventLocation,
    blog: row.blog,
    tags: row.talkTag.map(({ tag }) => tag),
  }));
