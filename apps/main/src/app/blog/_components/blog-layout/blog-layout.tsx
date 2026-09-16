import {
  Badge,
  PublishDateIcon,
  Separator,
  TagIcon,
  UpdateDateIcon,
} from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import Link from 'next/link';
import type { FC, ReactNode } from 'react';

import { SilentErrorBoundary } from '@/app/_components/error-boundary';
import { JsonLd } from '@/app/_components/json-ld';
import {
  getBlogContent,
  getBlogReadingTime,
  getBlogToc,
} from '@/features/blog/interface/queries';
import type { getBlogsByTags } from '@/features/blog/interface/queries';
import { blogBreadcrumbJsonLd, blogPostingJsonLd } from '@/shared/site/json-ld';

import { BlogHeader } from '../blog-header';
import { ArticleFrame } from './article-frame';
import { END_OF_CONTENT_ID } from './constants';
import { CopyMarkdownButton } from './copy-markdown-button';
import { Feedback } from './feedback';
import { Recommend, RecommendContent } from './recommend';
import { SlideLinkButton } from './slide-link-button';
import { TableOfContents, TableOfContentsSideRail } from './table-of-contents';
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
    <ArticleFrame hasToc={headingTree.children.length > 0}>
      <BlogHeader />
      <div className="xl:flex xl:gap-6">
        <ViewReporter slug={slug} />
        <div className="m-auto flex min-w-0 flex-1 flex-col gap-8 xl:max-w-5xl">
          <WritingModeContent>
            <article className="bg-bg-base/90 vertical:bg-transparent vertical:rounded-none rounded-xl px-4 py-8 sm:px-10">
              <header className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-fg-mute flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-flex translate-y-px">
                        <PublishDateIcon size="sm" />
                      </span>
                      公開: {formatDate(new Date(blog.createdAt))}
                    </span>
                    {blog.updatedAt !== blog.createdAt && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-flex translate-y-px">
                          <UpdateDateIcon size="sm" />
                        </span>
                        更新: {formatDate(new Date(blog.updatedAt))}
                      </span>
                    )}
                    <span>約{readingTime}分で読めます</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {blog.slideUrl !== undefined && (
                      <SlideLinkButton href={blog.slideUrl} />
                    )}
                    <CopyMarkdownButton slug={slug} />
                  </div>
                </div>
                <h2 className="text-xl leading-snug font-bold sm:text-2xl">
                  {blog.title}
                </h2>
                {blog.description !== null && (
                  <p className="text-fg-mute sm:text-md text-sm leading-normal">
                    {blog.description}
                  </p>
                )}
                {blog.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <TagIcon size="sm" />
                    {blog.tags.map((tag) => (
                      <Link href={`/tags/${tag.id.toString()}`} key={tag.id}>
                        <Badge interactive key={tag.id} label={tag.name} />
                      </Link>
                    ))}
                  </div>
                )}
              </header>
              <div className="my-6">
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
          <TableOfContentsSideRail
            className="hidden xl:block"
            headingTree={headingTree}
          />
        </SilentErrorBoundary>
        <SilentErrorBoundary>
          <TableOfContents headingTree={headingTree} />
        </SilentErrorBoundary>
      </div>
    </ArticleFrame>
  );
};

export const BlogLayout: FC<BlogLayoutProps> = async ({ children, slug }) => {
  // 3つは相互依存のない独立した 'use cache' クエリなので、キャッシュミス時の
  // 動的レンダーやビルド時プリレンダーで直列に待たないよう並列化する
  const [blog, headingTree, readingTime] = await Promise.all([
    getBlogContent(slug),
    getBlogToc(slug),
    getBlogReadingTime(slug),
  ]);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(blog)} />
      <JsonLd data={blogBreadcrumbJsonLd(blog)} />
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
