import { Feedback } from './feedback';
import { Recommend } from './recommend';
import { TableOfContext } from './table-of-context';
import { Tags } from './tags';
import { ViewCounter } from './view-counter';
import { ViewTransition } from '#libs/react';
import { getBlogMetadata } from '#services/blog';
import {
  PublishDateIcon,
  UpdateDateIcon,
  ViewIcon,
} from '@/components/icons';
import { ScrollLinked } from '@/components/scroll-linked';
import { Separator } from '@/components/separator';
import { formatDate } from '@/utils/date/format';
import { FC, ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const BlogLayout: FC<{
  children: ReactNode;
  slug: string;
}> = async ({ children, slug }) => {
  const metadata = await getBlogMetadata(slug);

  return (
    <div className="gap-4 xl:flex xl:has-[>:nth-child(2)]:-mx-36">
      <div className="m-auto flex flex-col gap-8 xl:max-w-4xl">
        <ViewTransition name={`all-${slug}`}>
          <article className="bg-bg-base/90 rounded-md px-3 pt-8 pb-14 sm:px-10">
            <div className="flex flex-col gap-3">
              <ViewTransition name={`title-${slug}`}>
                <h2 className="text-xl font-bold sm:text-2xl mb-5                ">
                  {metadata.title}
                </h2>
              </ViewTransition>
              {metadata.description && (
                <ViewTransition name={`description-${slug}`}>
                  <div
                    className="bg-bg-mute rounded-md p-4"
                    aria-label="記事の要約"
                  >
                    <p className="text-fg-base sm:text-md text-sm">
                      {metadata.description}
                    </p>
                  </div>
                </ViewTransition>
              )}
              <div className="text-fg-mute flex flex-col items-end gap-1 text-xs sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-sm">
                <div className="flex flex-wrap items-center justify-end gap-1">
                  <ViewTransition name={`date-${slug}`}>
                    <div className="flex items-center gap-1">
                      <PublishDateIcon size="sm" />
                      <span>
                        公開: {formatDate(metadata.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UpdateDateIcon size="sm" />
                      <span>
                        更新: {formatDate(metadata.updatedAt)}
                      </span>
                    </div>
                  </ViewTransition>
                </div>
                <ErrorBoundary fallback={<></>}>
                  <Suspense fallback={<></>}>
                    <div className="flex items-center gap-1">
                      <ViewIcon size="sm" />
                      <span className="sr-only">閲覧数</span>
                      <span>
                        <ViewCounter slug={slug} /> views
                      </span>
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
            <div className="m-2 w-full sm:mt-4">
              <Separator />
            </div>
            <ErrorBoundary fallback={<></>}>
              <Suspense fallback={<></>}>
                <Tags slug={slug} />
              </Suspense>
            </ErrorBoundary>
            {children}
          </article>
        </ViewTransition>
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
      <ScrollLinked />
    </div>
  );
};
