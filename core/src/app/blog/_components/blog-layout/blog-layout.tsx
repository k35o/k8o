import { Feedback } from './feedback';
import { Recommend } from './recommend';
import { TableOfContext } from './table-of-context';
import { ViewCounter } from './view-counter';
import { Subscribe } from '../subscribe';
import { getBlogContent } from '#api/blog';
import { ViewTransition } from '#libs/react';
import { ErrorBoundary } from '@k8o/arte-odyssey/error-boundary';
import {
  PublishDateIcon,
  SlideIcon,
  TagIcon,
  UpdateDateIcon,
  ViewIcon,
} from '@k8o/arte-odyssey/icons';
import { LinkButton } from '@k8o/arte-odyssey/link-button';
import { ScrollLinked } from '@k8o/arte-odyssey/scroll-linked';
import { Separator } from '@k8o/arte-odyssey/separator';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import { formatDate } from '@k8o/helpers/date';
import Link from 'next/link';
import { FC, ReactNode, Suspense } from 'react';

export const BlogLayout: FC<{
  children: ReactNode;
  slug: string;
}> = async ({ children, slug }) => {
  const blog = await getBlogContent(slug);

  return (
    <div className="gap-4 xl:flex xl:has-[>:nth-child(2)]:-mx-36">
      <div className="m-auto flex flex-col gap-8 xl:max-w-4xl">
        <article className="bg-bg-base/90 rounded-md px-3 pt-8 pb-14 sm:px-10">
          <div className="flex flex-col gap-3">
            <ViewTransition name={`title-${slug}`}>
              <h2 className="text-xl font-bold sm:text-2xl">
                {blog.title}
              </h2>
            </ViewTransition>
            {blog.description && (
              <ViewTransition name={`description-${slug}`}>
                <div
                  className="bg-bg-mute rounded-md p-4 sm:mt-4"
                  aria-label="記事の要約"
                >
                  <p className="text-fg-base sm:text-md text-sm">
                    {blog.description}
                  </p>
                </div>
              </ViewTransition>
            )}
            {blog.slideUrl && (
              <div className="flex self-end">
                <LinkButton
                  href={blog.slideUrl}
                  variant="outlined"
                  size="sm"
                  startIcon={<SlideIcon size="sm" />}
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
              <ErrorBoundary fallback={<></>}>
                <Suspense fallback={<></>}>
                  <div className="flex items-center gap-1">
                    <ViewIcon size="sm" />
                    <span className="sr-only">閲覧数</span>
                    <span>
                      <ViewCounter id={blog.id} /> views
                    </span>
                  </div>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
          <div className="m-2 w-full sm:mt-4">
            <Separator />
          </div>
          <ViewTransition name={`tags-${slug}`}>
            {blog.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <TagIcon size="sm" />
                {blog.tags.map((tag) => {
                  return (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.id.toString()}`}
                    >
                      <TextTag
                        key={tag.id}
                        text={tag.name}
                        clickable
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </ViewTransition>
          {children}
        </article>
        <ErrorBoundary fallback={<></>}>
          <section className="bg-bg-base/90 w-full rounded-md px-3 pt-8 pb-14 sm:px-10">
            <Feedback slug={slug} />
          </section>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Recommend slug={slug} />
        </ErrorBoundary>
      </div>
      <ErrorBoundary fallback={<></>}>
        <div className="hidden w-64 shrink-0 empty:hidden xl:block">
          <TableOfContext slug={slug} />
        </div>
      </ErrorBoundary>
      <Subscribe reading />
      <ScrollLinked />
    </div>
  );
};
