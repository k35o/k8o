import {
  findPublishedBlogRows,
  findPublishedBlogRowsByTags,
} from '../infrastructure/blog-repository';
import { findBlogMetadata } from './blog';

export const getBlogs = async () => {
  const blogRows = await findPublishedBlogRows();
  const blogs = await Promise.all(
    blogRows.map(async (blog) => {
      const metadata = await findBlogMetadata(blog.slug);
      if (metadata === null) {
        return null;
      }
      return {
        id: blog.id,
        slug: blog.slug,
        tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
        title: metadata.title,
        description: metadata.description,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
      };
    }),
  );
  return blogs.filter((blog) => blog !== null);
};

export const getBlogsByTags = async (slug: string, tagIds: number[]) => {
  const blogRows = await findPublishedBlogRowsByTags(slug, tagIds);

  const blogs = await Promise.all(
    blogRows
      .toSorted((a, b) => {
        const aBlogTagIds = new Set(a.blogTag.map((blogTag) => blogTag.tag.id));
        const bBlogTagIds = new Set(b.blogTag.map((blogTag) => blogTag.tag.id));
        const aTagCount = tagIds.filter((tagId) =>
          aBlogTagIds.has(tagId),
        ).length;
        const bTagCount = tagIds.filter((tagId) =>
          bBlogTagIds.has(tagId),
        ).length;
        return bTagCount - aTagCount;
      })
      .map(async (blog) => {
        const blogMetadata = await findBlogMetadata(blog.slug);
        if (blogMetadata === null) return null;
        return {
          id: blog.id,
          slug: blog.slug,
          title: blogMetadata.title,
          createdAt: blogMetadata.createdAt,
          tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
        };
      }),
  );
  // MDX欠損をスキップしても最大6件を保てるよう、絞り込みはメタデータ解決後に行う
  return blogs.filter((blog) => blog !== null).slice(0, 6);
};
