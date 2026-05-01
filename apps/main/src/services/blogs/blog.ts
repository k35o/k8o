import { db } from '@repo/database';
import { getFrontmatter } from '@repo/helpers/mdx/frontmatter';

import { getTocTree } from '../../libs/mdx/toc-tree';
import { blogPath } from './path';

export const getBlog = async (slug: string) => {
  const blog = await db.query.blogs.findFirst({
    where: (blogFields, { eq }) => eq(blogFields.slug, slug),
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

export const getBlogMetadata = (slug: string) => getFrontmatter(blogPath(slug));

export const getBlogToc = (slug: string) => getTocTree(blogPath(slug));
