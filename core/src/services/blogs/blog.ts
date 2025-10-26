import { getFrontmatter, getTocTree } from '@k8o/helpers/server';
import { db } from '#database/db';
import { blogPath } from './path';

export const getBlog = async (slug: string) => {
  const blog = await db.query.blogs.findFirst({
    where: (blog, { eq }) => eq(blog.slug, slug),
    with: {
      blogTag: {
        with: {
          tag: true,
        },
      },
      talks: true,
    },
  });

  if (!blog) {
    throw new Error(`Blog not found: ${slug}`);
  }

  return {
    id: blog.id,
    slug: blog.slug,
    tags: blog.blogTag.map((blogTag) => ({
      id: blogTag.tag.id,
      name: blogTag.tag.name,
    })),
    slideUrl: blog.talks[0]?.slideUrl,
  };
};

export const getBlogMetadata = async (slug: string) =>
  getFrontmatter(blogPath(slug));

export const getBlogToc = async (slug: string) => getTocTree(blogPath(slug));
