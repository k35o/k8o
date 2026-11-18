import { notFound } from '@k8ordo/framework';
import type { MDXContent } from 'mdx/types';
import type { FC } from 'react';

import { blogMdxComponents } from '@/components/blog/blog-mdx-components/blog-mdx-components';
import { MdxContent } from '@/components/site/mdx-base/mdx-base';
import { loadersBySlug } from '@/shared/glob/loaders-by-slug';

const articles = import.meta.glob<MDXContent>('@content/blog/*/article.mdx', {
  import: 'default',
});

const loadArticle = loadersBySlug(
  articles,
  /\/blog\/([a-z0-9-]+)\/article\.mdx$/u,
);

export const BlogArticle: FC<{ slug: string }> = async ({ slug }) => {
  const load = loadArticle.get(slug);
  if (load === undefined) {
    notFound();
  }
  const Article = await load();
  return <MdxContent Content={Article} components={blogMdxComponents(slug)} />;
};
