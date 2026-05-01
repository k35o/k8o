import {
  Badge,
  LinkButton,
  PublishDateIcon,
  Separator,
  SlideIcon,
  TagIcon,
  UpdateDateIcon,
  ViewIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import { commalize } from '@repo/helpers/number/commalize';
import Link from 'next/link';
import { type FC, type ReactNode, Suspense, ViewTransition } from 'react';

import { SilentErrorBoundary } from '@/app/_components/error-boundary';
import {
  getBlogContent,
  type getBlogsByTags,
  getBlogToc,
} from '@/app/blog/_api';

import { END_OF_CONTENT_ID } from './constants';
import { CopyMarkdownButton } from './copy-markdown-button';
import { Feedback } from './feedback';
import { Recommend, RecommendContent } from './recommend';
import { TableOfContents } from './table-of-contents';
import { ViewCounter } from './view-counter';
import { ViewReporter } from './view-reporter';

type BlogLayoutProps = {
  children: ReactNode;
  slug: string;
};

type BlogLayoutContentProps = BlogLayoutProps & {
  blog: Awaited<ReturnType<typeof getBlogContent>>;
  headingTree: Awaited<ReturnType<typeof getBlogToc>>;
  recommendedBlogs?: Awaited<ReturnType<typeof getBlogsByTags>>;
  viewCount?: number;
};

export const BlogLayoutContent: FC<BlogLayoutContentProps> = ({
  blog,
  children,
  headingTree,
  recommendedBlogs,
  slug,
  viewCount,
}) => {
  const shouldUseRecommendedBlogs = recommendedBlogs !== undefined;

  return (
    <div className="gap-4 xl:flex">
      <ViewReporter slug={slug} />
      <div className="m-auto flex flex-col gap-8 xl:max-w-5xl">
        <article className="bg-bg-base/90 rounded-xl px-3 py-8 sm:px-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <ViewTransition name={`title-${slug}`}>
                <h2 className="text-xl font-bold sm:text-2xl">{blog.title}</h2>
              </ViewTransition>
              <CopyMarkdownButton slug={slug} />
            </div>
            {blog.description !== null && (
              <ViewTransition name={`description-${slug}`}>
                <div className="bg-bg-mute rounded-xl p-4 sm:mt-4">
                  <p className="text-fg-base sm:text-md text-sm">
                    {blog.description}
                  </p>
                </div>
              </ViewTransition>
            )}
            {blog.slideUrl !== undefined && (
              <div className="flex self-end">
                <LinkButton
                  href={blog.slideUrl}
                  size="sm"
                  startIcon={<SlideIcon size="sm" />}
                  variant="outlined"
                >
                  スライドを見る
                </LinkButton>
              </div>
            )}
            <div className="text-fg-mute flex flex-col items-end gap-1 text-xs sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-sm">
              <div className="flex flex-wrap items-center justify-end gap-1">
                <ViewTransition name={`date-${slug}`}>
                  <div className="flex items-center gap-1">
                    <PublishDateIcon size="sm" />
                    <span>公開: {formatDate(blog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UpdateDateIcon size="sm" />
                    <span>更新: {formatDate(blog.updatedAt)}</span>
                  </div>
                </ViewTransition>
              </div>
              <SilentErrorBoundary>
                {viewCount === undefined ? (
                  <Suspense fallback={null}>
                    <div className="flex items-center gap-1">
                      <ViewIcon size="sm" />
                      <span className="sr-only">閲覧数</span>
                      <span>
                        <ViewCounter id={blog.id} /> views
                      </span>
                    </div>
                  </Suspense>
                ) : (
                  <div className="flex items-center gap-1">
                    <ViewIcon size="sm" />
                    <span className="sr-only">閲覧数</span>
                    <span>{commalize(viewCount)} views</span>
                  </div>
                )}
              </SilentErrorBoundary>
            </div>
            <ViewTransition name={`tags-${slug}`}>
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
            </ViewTransition>
          </div>
          <div className="m-2 sm:mt-4">
            <Separator />
          </div>
          {children}
        </article>
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

  return (
    <BlogLayoutContent blog={blog} headingTree={headingTree} slug={slug}>
      {children}
    </BlogLayoutContent>
  );
};
