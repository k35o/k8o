import { formatDate } from '@/utils/date/format';
import { Calendar, Eye } from 'lucide-react';
import { FC, ReactNode, Suspense } from 'react';
import { ViewCoounter } from '../view-counter';
import { Slug } from '../../_types';
import { ErrorBoundary } from 'react-error-boundary';

export const BlogLayout: FC<{
  children: ReactNode;
  updatedAt: string;
  slug: Slug;
}> = ({ children, updatedAt, slug }) => {
  return (
    <div className="flex flex-col gap-4">
      <article className="rounded-lg bg-bgBase/90 px-3 py-14 pt-4 sm:px-10">
        <div className="flex items-center justify-end gap-4 text-sm text-textDescription">
          <ErrorBoundary fallback={<></>}>
            <Suspense fallback={<></>}>
              <div className="flex items-center gap-1">
                <Eye className="size-4" />
                <ViewCoounter slug={slug} />
              </div>
            </Suspense>
          </ErrorBoundary>
          <div className="flex items-center gap-1">
            <Calendar className="size-4" />
            <span>
              {formatDate(updatedAt, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
        {children}
      </article>
    </div>
  );
};
