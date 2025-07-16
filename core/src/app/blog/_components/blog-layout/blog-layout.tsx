import { Content } from './content';
import { Feedback } from './feedback';
import { Recommend } from './recommend';
import { TableOfContext } from './table-of-context';
import { ViewCounter } from './view-counter';
import { Subscribe } from '../subscribe';
import { getBlogContent } from '#api/blog';
import { ViewIcon } from '@/components/icons';
import { FC, ReactNode, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const BlogLayout: FC<{
  children: ReactNode;
  slug: string;
}> = async ({ children, slug }) => {
  const blog = await getBlogContent(slug);

  return (
    <div className="gap-4 xl:flex xl:has-[>:nth-child(2)]:-mx-36">
      <div className="m-auto flex flex-col gap-8 xl:max-w-4xl">
        <Content
          blog={blog}
          views={
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
          }
        >
          {children}
        </Content>
        <ErrorBoundary fallback={<></>}>
          <section className="bg-bg-base/90 w-full rounded-md px-3 pb-14 pt-8 sm:px-10">
            <Feedback slug={blog.slug} />
          </section>
        </ErrorBoundary>
        <ErrorBoundary fallback={<></>}>
          <Recommend slug={blog.slug} />
        </ErrorBoundary>
      </div>
      <ErrorBoundary fallback={<></>}>
        <div className="hidden w-64 shrink-0 empty:hidden xl:block">
          <TableOfContext slug={blog.slug} />
        </div>
      </ErrorBoundary>
      <Subscribe reading />
    </div>
  );
};
