import { formatDate } from '@/utils/date/format';
import { Calendar, Clock, Eye } from 'lucide-react';
import { FC, ReactNode, Suspense } from 'react';
import { ViewCounter } from '../view-counter';
import { ErrorBoundary } from 'react-error-boundary';
import { getBlog } from '#actions/blog';
import { Heading } from '@/components/heading';
import { Separator } from '@/components/separator';
import { ReportView } from '../report-view';

export const BlogLayout: FC<{
  children: ReactNode;
  slug: string;
}> = async ({ children, slug }) => {
  const blog = await getBlog({ slug });

  return (
    <div className="flex flex-col gap-4">
      {blog ? (
        <article className="rounded-lg bg-bgBase/90 px-3 py-14 pt-4 sm:px-10">
          <ReportView blogId={blog.id} />
          <div className="flex flex-col gap-3">
            <Heading type="h2">{blog.title}</Heading>
            <div className="flex items-center gap-4 text-sm text-textDescription">
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                <span>公開: {formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>更新: {formatDate(blog.updatedAt)}</span>
              </div>
              <ErrorBoundary fallback={<></>}>
                <Suspense fallback={<></>}>
                  <div className="flex items-center gap-1">
                    <Eye className="size-4" />
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
              <p className="text-textDescription">
                {blog.description}
              </p>
            </div>
          </div>
          <div className="mb-4 mt-8 w-full">
            <Separator />
          </div>
          {children}
        </article>
      ) : (
        <article className="rounded-lg bg-bgBase/90 px-3 py-14 pt-4 sm:px-10">
          {children}
        </article>
      )}
    </div>
  );
};
