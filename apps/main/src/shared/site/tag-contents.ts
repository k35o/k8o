import { getBlogContents } from '@/features/blog/interface/queries';
import { getTag, getTags } from '@/features/tags/interface/queries';

// タグの記事は DB の公開済みではなく、MDX のある公開済みの記事の一覧から引く。題は MDX にあり、
// MDX の無い記事はサイトに出ないので、DB だけで数えると中身の無いタグを sitemap と一覧に載せてしまう
const findBlogTitles = async (): Promise<ReadonlyMap<number, string>> =>
  new Map((await getBlogContents()).map((blog) => [blog.id, blog.title]));

export async function getTagSummaries(): Promise<
  Array<{
    id: number;
    name: string;
    blogCount: number;
    talkCount: number;
  }>
> {
  const [tags, blogTitles] = await Promise.all([getTags(), findBlogTitles()]);

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    blogCount: tag.blogIds.filter((blogId) => blogTitles.has(blogId)).length,
    talkCount: tag.talkCount,
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
  const [tag, blogTitles] = await Promise.all([getTag(id), findBlogTitles()]);

  return {
    id: tag.id,
    name: tag.name,
    blogs: tag.blogs.flatMap((blog) => {
      const title = blogTitles.get(blog.id);
      return title === undefined ? [] : [{ ...blog, title }];
    }),
    talks: tag.talks,
  };
}
