import { formatDate } from '@/utils/date/format';
import { Calendar, Clock, Eye } from 'lucide-react';
import { FC, ReactNode, Suspense } from 'react';
import { ViewCounter } from '../view-counter';
import { ErrorBoundary } from 'react-error-boundary';
import { getBlog } from '#actions/blog';
import { Separator } from '@/components/separator';
import { ReportView } from '../report-view';
import { TextTag } from '@/components/text-tag';
import { TableOfContext } from '../table-of-context';

export const BlogLayout: FC<{
  children: ReactNode;
  slug: string;
}> = async ({ children, slug }) => {
  const blog = await getBlog({ slug });

  return (
    <div className="gap-4 xl:flex xl:has-[>:nth-child(2)]:-mx-36">
      {blog ? (
        <article className="rounded-lg bg-bgBase/90 px-3 pb-14 pt-8 sm:px-10">
          <ReportView blogId={blog.id} />
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold sm:text-2xl">
              {blog.title}
            </h2>
            <div className="flex flex-col items-end gap-1 text-xs text-textDescription sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:text-sm">
              <div className="flex flex-wrap items-center justify-end gap-1">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" aria-label="" />
                  <span>公開: {formatDate(blog.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-4" aria-label="" />
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
            <div
              className="rounded-lg bg-bgSecondary p-4"
              aria-label="記事の要約"
            >
              <p className="text-sm text-textBody sm:text-base">
                {blog.description}
              </p>
            </div>
          </div>
          <div className="mb-2 mt-4 w-full sm:mb-4 sm:mt-8">
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
        <article className="rounded-lg bg-bgBase/90 px-3 py-14 pt-4 sm:px-10">
          {children}
        </article>
      )}
      <ErrorBoundary fallback={<></>}>
        <div className="hidden w-64 flex-shrink-0 xl:block">
          <TableOfContext slug={slug} />
        </div>
      </ErrorBoundary>
    </div>
  );
};
