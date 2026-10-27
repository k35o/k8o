import { notFound } from '@k8ordo/framework';
import type { MDXContent } from 'mdx/types';
import type { FC } from 'react';

import { blogMdxComponents } from '@/components/blog/blog-mdx-components/blog-mdx-components';
import { MdxContent } from '@/components/site/mdx-base/mdx-base';

// plugin-rsc は .tsx などの部品にしか、import した CSS を差し込む包みを付けない。
// query で .mdx の default も包ませ、記事が読む KaTeX や CSS Modules を載せる
const articles = import.meta.glob<MDXContent>('@content/blog/*/article.mdx', {
  import: 'default',
  query: '?vite-rsc-css-export=default',
});

const ARTICLE_FILE = /\/blog\/([a-z0-9-]+)\/article\.mdx$/u;

const loadArticle = new Map(
  Object.entries(articles).flatMap(([file, load]) => {
    const slug = ARTICLE_FILE.exec(file)?.[1];
    return slug === undefined ? [] : [[slug, load] as const];
  }),
);

export const BlogArticle: FC<{ slug: string }> = async ({ slug }) => {
  const load = loadArticle.get(slug);
  if (load === undefined) {
    notFound();
  }
  const Article = await load();
  return <MdxContent Content={Article} components={blogMdxComponents} />;
};
