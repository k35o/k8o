import type { FC, ReactNode } from 'react';

import { JsonLd } from '@/components/site/json-ld/json-ld';
import {
  getBlogContent,
  getBlogReadingTime,
  getBlogsByTags,
  getBlogToc,
} from '@/features/blog/interface/queries';
import { blogBreadcrumbJsonLd, blogPostingJsonLd } from '@/shared/site/json-ld';

import { BlogLayoutContent } from './blog-layout-content';

type BlogLayoutProps = {
  children: ReactNode;
  slug: string;
};

export const BlogLayout: FC<BlogLayoutProps> = async ({ children, slug }) => {
  const [blog, headingTree, readingTime, recommendedBlogs] = await Promise.all([
    getBlogContent(slug),
    getBlogToc(slug),
    getBlogReadingTime(slug),
    getBlogsByTags(slug),
  ]);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(blog)} />
      <JsonLd data={blogBreadcrumbJsonLd(blog)} />
      <BlogLayoutContent
        blog={blog}
        headingTree={headingTree}
        readingTime={readingTime}
        recommendedBlogs={recommendedBlogs}
        slug={slug}
      >
        {children}
      </BlogLayoutContent>
    </>
  );
};
