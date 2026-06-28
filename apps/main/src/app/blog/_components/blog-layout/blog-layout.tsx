/* oxlint-disable import/max-dependencies -- 記事ページのレイアウトを構成する route 専用コンポーネントを集約するため */

import {
  Badge,
  PublishDateIcon,
  Separator,
  TagIcon,
  UpdateDateIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { SilentErrorBoundary } from '@/app/_components/error-boundary';
import { JsonLd } from '@/app/_components/json-ld';
import {
  getBlogContent,
  getBlogReadingTime,
  type getBlogsByTags,
  getBlogToc,
} from '@/features/blog/interface/queries';
import { blogPostingJsonLd } from '@/shared/site/json-ld';

import { END_OF_CONTENT_ID } from './constants';
import { CopyMarkdownButton } from './copy-markdown-button';
import { Feedback } from './feedback';
import { Recommend, RecommendContent } from './recommend';
import { SlideLinkButton } from './slide-link-button';
import { TableOfContents } from './table-of-contents';
import { ViewReporter } from './view-reporter';
import { WritingModeContent } from './writing-mode';

type BlogLayoutProps = {
  children: ReactNode;
  slug: string;
};

type BlogLayoutContentProps = BlogLayoutProps & {
  blog: Awaited<ReturnType<typeof getBlogContent>>;
  headingTree: Awaited<ReturnType<typeof getBlogToc>>;
  recommendedBlogs?: Awaited<ReturnType<typeof getBlogsByTags>>;
  readingTime: number;
};

export const BlogLayoutContent: FC<BlogLayoutContentProps> = ({
  blog,
  children,
  headingTree,
  readingTime,
  recommendedBlogs,
  slug,
}) => {
  const shouldUseRecommendedBlogs = recommendedBlogs !== undefined;

  return (
    <div className="gap-4 xl:flex">
      <ViewReporter slug={slug} />
      <div className="m-auto flex flex-1 flex-col gap-8 xl:max-w-5xl">
        <WritingModeContent>
          <article className="bg-bg-base/90 vertical:bg-transparent vertical:rounded-none rounded-xl px-3 py-8 sm:px-10">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold sm:text-2xl">{blog.title}</h2>
                <div className="flex items-center gap-1">
                  <CopyMarkdownButton slug={slug} />
                </div>
              </div>
              {blog.description !== null && (
                <div className="bg-bg-mute rounded-xl p-4 sm:mt-4">
                  <p className="text-fg-base sm:text-md text-sm">
                    {blog.description}
                  </p>
                </div>
              )}
              {blog.slideUrl !== undefined && (
                <div className="flex self-end">
                  <SlideLinkButton href={blog.slideUrl} />
                </div>
              )}
              <div className="text-fg-mute flex flex-col items-end gap-1 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <span>約{readingTime}分で読めます</span>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <div className="flex items-center gap-1">
                    <PublishDateIcon size="sm" />
                    <span>公開: {formatDate(new Date(blog.createdAt))}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UpdateDateIcon size="sm" />
                    <span>更新: {formatDate(new Date(blog.updatedAt))}</span>
                  </div>
                </div>
              </div>
              {blog.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <TagIcon size="sm" />
                  {blog.tags.map((tag) => (
                    <Link href={`/tags/${tag.id.toString()}`} key={tag.id}>
                      <Badge interactive key={tag.id} text={tag.name} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="m-2 sm:mt-4">
              <Separator />
            </div>
            {children}
          </article>
        </WritingModeContent>
        <div id={END_OF_CONTENT_ID}>
          <SilentErrorBoundary>
            <section className="bg-bg-base/90 w-full rounded-xl px-3 py-8 sm:px-10">
              <Feedback slug={slug} />
            </section>
          </SilentErrorBoundary>
          <SilentErrorBoundary>
            {shouldUseRecommendedBlogs ? (
              <RecommendContent blogs={recommendedBlogs} />
            ) : (
              <Recommend slug={slug} />
            )}
          </SilentErrorBoundary>
        </div>
      </div>
      <SilentErrorBoundary>
        <TableOfContents headingTree={headingTree} />
      </SilentErrorBoundary>
    </div>
  );
};

export const BlogLayout: FC<BlogLayoutProps> = async ({ children, slug }) => {
  const blog = await getBlogContent(slug);
  const headingTree = await getBlogToc(slug);
  const readingTime = await getBlogReadingTime(slug);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(blog)} />
      <BlogLayoutContent
        blog={blog}
        headingTree={headingTree}
        readingTime={readingTime}
        slug={slug}
      >
        {children}
      </BlogLayoutContent>
    </>
  );
};
