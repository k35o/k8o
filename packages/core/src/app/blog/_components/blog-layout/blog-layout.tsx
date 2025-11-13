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
import { type FC, type ReactNode, Suspense } from 'react';
import { getBlogContent } from '@/app/blog/_api';
import { ViewTransition } from '@/libs/react';
import { Subscribe } from '../subscribe';
import { Feedback } from './feedback';
import { Recommend } from './recommend';
import { TableOfContext } from './table-of-context';
import { ViewCounter } from './view-counter';

export const BlogLayout: FC<{
  children: ReactNode;
  slug: string;
}> = async ({ children, slug }) => {
  const blog = await getBlogContent(slug);

  return (
    <div className="xl:has-[>:nth-child(2)]:-mx-36 gap-4 xl:flex">
      <div className="m-auto flex flex-col gap-8 xl:max-w-4xl">
        <article className="rounded-md bg-bg-base/90 px-3 pt-8 pb-14 sm:px-10">
          <div className="flex flex-col gap-3">
            <ViewTransition name={`title-${slug}`}>
              <h2 className="font-bold text-xl sm:text-2xl">{blog.title}</h2>
            </ViewTransition>
            {blog.description && (
              <ViewTransition name={`description-${slug}`}>
                <div className="rounded-md bg-bg-mute p-4 sm:mt-4">
                  <p className="text-fg-base text-sm sm:text-md">
                    {blog.description}
                  </p>
                </div>
              </ViewTransition>
            )}
            {blog.slideUrl && (
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
            <div className="flex flex-col items-end gap-1 text-fg-mute text-xs sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-sm">
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
              <ErrorBoundary fallback={null}>
                <Suspense fallback={null}>
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
                    <Link href={`/tags/${tag.id.toString()}`} key={tag.id}>
                      <TextTag clickable key={tag.id} text={tag.name} />
                    </Link>
                  );
                })}
              </div>
            )}
          </ViewTransition>
          {children}
        </article>
        <ErrorBoundary fallback={null}>
          <section className="w-full rounded-md bg-bg-base/90 px-3 pt-8 pb-14 sm:px-10">
            <Feedback slug={slug} />
          </section>
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <Recommend slug={slug} />
        </ErrorBoundary>
      </div>
      <ErrorBoundary fallback={null}>
        <div className="hidden w-64 shrink-0 empty:hidden xl:block">
          <TableOfContext slug={slug} />
        </div>
      </ErrorBoundary>
      <Subscribe reading />
      <ScrollLinked />
    </div>
  );
};
