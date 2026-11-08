import { getPublishedBlogs } from '@repo/api/build-data';

import { findBlogMetadata } from './blog';

type TagRef = { id: number; name: string };

export type Blog = {
  id: number;
  slug: string;
  tags: TagRef[];
  slideUrl: string | null;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  featureIds: string[];
};

// 公開済みで MDX のある記事を、api の一覧の並び（新しい順）のまま返す。題・説明・日付は MDX から足す
export const getBlogs = async (): Promise<Blog[]> => {
  const blogs = await Promise.all(
    (await getPublishedBlogs()).map(async (blog) => {
      const metadata = await findBlogMetadata(blog.slug);
      if (metadata === null) {
        return null;
      }
      return {
        id: blog.id,
        slug: blog.slug,
        tags: blog.tags,
        slideUrl: blog.slideUrl,
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
        featureIds: metadata.featureIds ?? [],
      };
    }),
  );
  return blogs.filter((blog) => blog !== null);
};

const RELATED_BLOGS_LIMIT = 6;

// タグを共有する記事を、共有するタグの多い順に返す。同じ数なら一覧の並びのまま
export const selectRelatedBlogs = (
  blogs: readonly Blog[],
  slug: string,
): Blog[] => {
  const current = blogs.find((blog) => blog.slug === slug);
  if (current === undefined) {
    return [];
  }
  const tagIds = new Set(current.tags.map((tag) => tag.id));
  const sharedTagCount = (blog: Blog): number =>
    blog.tags.filter((tag) => tagIds.has(tag.id)).length;
  return blogs
    .filter((blog) => blog.slug !== slug && sharedTagCount(blog) > 0)
    .toSorted((a, b) => sharedTagCount(b) - sharedTagCount(a))
    .slice(0, RELATED_BLOGS_LIMIT);
};
