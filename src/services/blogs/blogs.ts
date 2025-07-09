import { blogPath } from './path';
import { db } from '#database/db';
import { getFrontmatter } from '@k8o/helpers/mdx';

export const getBlogs = async () => {
  const blogs = await db.query.blogs.findMany({
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    where: (blogs, { eq }) => eq(blogs.published, true),
    limit: 50,
    orderBy(fields, operators) {
      return [
        operators.desc(fields.createdAt),
        operators.desc(fields.id),
      ];
    },
  });

  return blogs.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
  }));
};

export const getBlogsByTags = async (
  slug: string,
  tagIds: number[],
) => {
  const blogIds = (
    await db.query.blogTag.findMany({
      where: (blogTag, { inArray }) => inArray(blogTag.tagId, tagIds),
      columns: {
        blogId: true,
      },
    })
  ).map((blogTag) => blogTag.blogId);

  const blogs = await db.query.blogs.findMany({
    where: (blogs, { not, eq, inArray, and }) =>
      and(
        not(eq(blogs.slug, slug)),
        inArray(blogs.id, blogIds),
        eq(blogs.published, true),
      ),
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    orderBy(fields, operators) {
      return [
        operators.desc(fields.createdAt),
        operators.desc(fields.id),
      ];
    },
  });

  return Promise.all(
    blogs
      .sort((a, b) => {
        const aBlogTagIds = a.blogTag.map(
          (blogTag) => blogTag.tag.id,
        );
        const bBlogTagIds = b.blogTag.map(
          (blogTag) => blogTag.tag.id,
        );
        const aTagCount = tagIds.filter((tagId) =>
          aBlogTagIds.includes(tagId),
        ).length;
        const bTagCount = tagIds.filter((tagId) =>
          bBlogTagIds.includes(tagId),
        ).length;
        return bTagCount - aTagCount;
      })
      .slice(0, 6)
      .map(async (blog) => {
        const blogMetadata = await getFrontmatter(
          blogPath(blog.slug),
        );
        return {
          id: blog.id,
          slug: blog.slug,
          title: blogMetadata.title,
          createdAt: blogMetadata.createdAt,
          tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
        };
      }),
  );
};
