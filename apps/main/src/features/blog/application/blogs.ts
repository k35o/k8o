import { db } from '@repo/database';
import { getFrontmatter } from '@repo/helpers/mdx/frontmatter';

import { blogPath } from './path';

export const getBlogs = async () => {
  const blogRows = await db.query.blogs.findMany({
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    where: (blogFields, { eq }) => eq(blogFields.published, true),
    limit: 100,
    orderBy(fields, operators) {
      return [operators.desc(fields.createdAt), operators.desc(fields.id)];
    },
  });

  return blogRows.map((blog) => ({
    id: blog.id,
    slug: blog.slug,
    tags: blog.blogTag.map((blogTag) => blogTag.tag.name),
  }));
};

export const getBlogsByTags = async (slug: string, tagIds: number[]) => {
  const blogIds = (
    await db.query.blogTag.findMany({
      where: (blogTag, { inArray }) => inArray(blogTag.tagId, tagIds),
      columns: {
        blogId: true,
      },
    })
  ).map((blogTag) => blogTag.blogId);

  const blogRows = await db.query.blogs.findMany({
    where: (blogFields, { not, eq, inArray, and }) =>
      and(
        not(eq(db._schema.blogs.slug, slug)),
        inArray(blogFields.id, blogIds),
        eq(db._schema.blogs.published, true),
      ),
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
    },
    orderBy(fields, operators) {
      return [operators.desc(fields.createdAt), operators.desc(fields.id)];
    },
  });

  return Promise.all(
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
      .slice(0, 6)
      .map(async (blog) => {
        const blogMetadata = await getFrontmatter(blogPath(blog.slug));
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
