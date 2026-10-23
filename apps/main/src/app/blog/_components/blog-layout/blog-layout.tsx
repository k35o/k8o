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
  getBlogsByTags,
  getBlogToc,
} from '@/features/blog/interface/queries';
import { blogBreadcrumbJsonLd, blogPostingJsonLd } from '@/shared/site/json-ld';

import { BlogHeader } from '../blog-header';
import { ArticleFrame } from './article-frame';
import { END_OF_CONTENT_ID } from './constants';
import { CopyMarkdownButton } from './copy-markdown-button';
import { Feedback } from './feedback';
import { Recommend } from './recommend';
import { SlideLinkButton } from './slide-link-button';
import { TableOfContents, TableOfContentsSideRail } from './table-of-contents';
import { ViewReporter } from './view-reporter';
import { WritingModeContent } from './writing-mode';

import styles from './blog-layout.module.css';

type BlogLayoutProps = {
  children: ReactNode;
  slug: string;
};

type BlogLayoutContentProps = BlogLayoutProps & {
  blog: Awaited<ReturnType<typeof getBlogContent>>;
  headingTree: Awaited<ReturnType<typeof getBlogToc>>;
  recommendedBlogs: Awaited<ReturnType<typeof getBlogsByTags>>;
  readingTime: number;
};

export const BlogLayoutContent: FC<BlogLayoutContentProps> = ({
  blog,
  children,
  headingTree,
  readingTime,
  recommendedBlogs,
  slug,
}) => (
  <ArticleFrame hasToc={headingTree.children.length > 0}>
    <BlogHeader />
    <div className={styles.columns}>
      <ViewReporter slug={slug} />
      <div className={styles.main}>
        <WritingModeContent>
          <article className={styles.article}>
            <header className={styles.header}>
              <div className={styles.headerRow}>
                <div className={styles.meta}>
                  <span className={styles.metaItem}>
                    <span className={styles.metaIcon}>
                      <PublishDateIcon size="sm" />
                    </span>
                    公開: {formatDate(new Date(blog.createdAt))}
                  </span>
                  {blog.updatedAt !== blog.createdAt && (
                    <span className={styles.metaItem}>
                      <span className={styles.metaIcon}>
                        <UpdateDateIcon size="sm" />
                      </span>
                      更新: {formatDate(new Date(blog.updatedAt))}
                    </span>
                  )}
                  <span>約{readingTime}分で読めます</span>
                </div>
                <div className={styles.actions}>
                  {blog.slideUrl !== undefined && (
                    <SlideLinkButton href={blog.slideUrl} />
                  )}
                  <CopyMarkdownButton slug={slug} />
                </div>
              </div>
              <h2 className={styles.title}>{blog.title}</h2>
              {blog.description !== null && (
                <p className={styles.description}>{blog.description}</p>
              )}
              {blog.tags.length > 0 && (
                <div className={styles.tags}>
                  <TagIcon size="sm" />
                  {blog.tags.map((tag) => (
                    <Link href={`/tags/${tag.id.toString()}`} key={tag.id}>
                      <Badge interactive key={tag.id} label={tag.name} />
                    </Link>
                  ))}
                </div>
              )}
            </header>
            <div className={styles.separator}>
              <Separator />
            </div>
            {children}
          </article>
        </WritingModeContent>
        <div className={styles.footer} id={END_OF_CONTENT_ID}>
          <SilentErrorBoundary>
            <section className={styles.feedback}>
              <Feedback slug={slug} />
            </section>
          </SilentErrorBoundary>
          <SilentErrorBoundary>
            <Recommend blogs={recommendedBlogs} />
          </SilentErrorBoundary>
        </div>
      </div>
      <SilentErrorBoundary>
        <TableOfContentsSideRail
          className={styles.sideRail}
          headingTree={headingTree}
        />
      </SilentErrorBoundary>
      <SilentErrorBoundary>
        <TableOfContents headingTree={headingTree} />
      </SilentErrorBoundary>
    </div>
  </ArticleFrame>
);

export const BlogLayout: FC<BlogLayoutProps> = async ({ children, slug }) => {
  // 相互依存のない独立した 'use cache' クエリなので、キャッシュミス時の
  // 動的レンダーやビルド時プリレンダーで直列に待たないよう並列化する
  const [blog, headingTree, readingTime, recommendedBlogs] = await Promise.all([
    getBlogContent(slug),
    getBlogToc(slug),
    getBlogReadingTime(slug),
    getBlogsByTags(slug),
  ]);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(blog)} />
      <JsonLd data={blogBreadcrumbJsonLd(blog)} />
      <BlogLayoutContent
        blog={blog}
        headingTree={headingTree}
        readingTime={readingTime}
        recommendedBlogs={recommendedBlogs}
        slug={slug}
      >
        {children}
      </BlogLayoutContent>
    </>
  );
};
