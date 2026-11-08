import { getBlogContents } from '@/features/blog/interface/queries';
import { getTag, getTags } from '@/features/tags/interface/queries';
import { getTalks } from '@/features/talks/interface/queries';

// タグの記事は DB の公開済みではなく、MDX のある公開済みの記事の一覧から引く。題は MDX にあり、
// MDX の無い記事はサイトに出ないので、DB だけで数えると中身の無いタグを sitemap と一覧に載せてしまう
const findBlogs = async (): Promise<
  ReadonlyMap<number, { id: number; slug: string; title: string }>
> =>
  new Map(
    (await getBlogContents()).map((blog) => [
      blog.id,
      { id: blog.id, slug: blog.slug, title: blog.title },
    ]),
  );

export async function getTagSummaries(): Promise<
  Array<{
    id: number;
    name: string;
    blogCount: number;
    talkCount: number;
  }>
> {
  const [tags, blogs] = await Promise.all([getTags(), findBlogs()]);

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    blogCount: tag.blogIds.filter((blogId) => blogs.has(blogId)).length,
    talkCount: tag.talkIds.length,
  }));
}

export async function getTagContent(id: number): Promise<{
  id: number;
  name: string;
  blogs: Array<{
    id: number;
    slug: string;
    title: string;
  }>;
  talks: Array<{
    id: number;
    title: string;
  }>;
}> {
  const [tag, blogs, talks] = await Promise.all([
    getTag(id),
    findBlogs(),
    getTalks(),
  ]);
  const talkTitles = new Map(talks.map((talk) => [talk.id, talk.title]));

  return {
    id: tag.id,
    name: tag.name,
    blogs: tag.blogIds.flatMap((blogId) => {
      const blog = blogs.get(blogId);
      return blog === undefined ? [] : [blog];
    }),
    talks: tag.talkIds.flatMap((talkId) => {
      const title = talkTitles.get(talkId);
      return title === undefined ? [] : [{ id: talkId, title }];
    }),
  };
}
