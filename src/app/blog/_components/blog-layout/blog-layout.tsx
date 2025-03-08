import { ReportView } from '../report-view';
import { TableOfContext } from '../table-of-context';
import { ViewCounter } from '../view-counter';
import { getBlog } from '#actions/blog';
import { PublishDateIcon, UpdateDateIcon } from '@/components/icons';
import { ScrollLinked } from '@/components/scroll-linked';
import { Separator } from '@/components/separator';
import { TextTag } from '@/components/text-tag';
import { formatDate } from '@/utils/date/format';
import { Eye } from 'lucide-react';
import { FC, ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const BlogLayout: FC<{
  children: ReactNode;
  slug: string;
}> = async ({ children, slug }) => {
  const blog = await getBlog({ slug });

  return (
    <div className="gap-4 xl:flex xl:has-[>:nth-child(2)]:-mx-36">
      {blog ? (
        <article className="bg-bg-base/90 rounded-md px-3 pt-8 pb-14 sm:px-10">
          <ReportView blogId={blog.id} />
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold sm:text-2xl">
              {blog.title}
            </h2>
            <div className="text-fg-mute flex flex-col items-end gap-1 text-xs sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-sm">
              <div className="flex flex-wrap items-center justify-end gap-1">
                <div className="flex items-center gap-1">
                  <PublishDateIcon size="sm" />
                  <span>公開: {formatDate(blog.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UpdateDateIcon size="sm" />
                  <span>更新: {formatDate(blog.updatedAt)}</span>
                </div>
              </div>
              <ErrorBoundary fallback={<></>}>
                <Suspense fallback={<></>}>
                  <div className="flex items-center gap-1">
                    <Eye className="size-4" aria-label="閲覧数" />
                    <span>
                      <ViewCounter blogId={blog.id} /> views
                    </span>
                  </div>
                </Suspense>
              </ErrorBoundary>
            </div>
            {blog.description && (
              <div
                className="bg-bg-mute rounded-md p-4"
                aria-label="記事の要約"
              >
                <p className="text-fg-base sm:text-md text-sm">
                  {blog.description}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 mb-2 w-full sm:mt-8 sm:mb-4">
            <Separator />
          </div>
          {blog.tags.length > 0 && (
            <div className="mb-4 flex gap-2">
              {blog.tags.slice(0, 5).map((tag) => {
                return <TextTag key={tag} text={tag} />;
              })}
            </div>
          )}
          {children}
        </article>
      ) : (
        <article className="bg-bg-base/90 rounded-md px-3 py-14 pt-4 sm:px-10">
          {children}
        </article>
      )}
      <ErrorBoundary fallback={<></>}>
        <div className="hidden w-64 shrink-0 empty:hidden xl:block">
          <TableOfContext slug={slug} />
        </div>
      </ErrorBoundary>
      <ScrollLinked />
    </div>
  );
};
