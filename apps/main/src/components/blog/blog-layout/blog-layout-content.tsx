import { href } from '@k8ordo/framework';
import {
  Badge,
  PublishDateIcon,
  Separator,
  TagIcon,
  UpdateDateIcon,
} from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC, ReactNode } from 'react';

import { SilentErrorBoundary } from '@/components/site/error-boundary/silent-error-boundary';
import type {
  getBlogContent,
  getBlogsByTags,
  getBlogToc,
} from '@/features/blog/interface/queries';

import { BlogHeader } from '../blog-header/blog-header';
import { ArticleFrame } from './article-frame';
import { END_OF_CONTENT_ID } from './constants';
import { CopyMarkdownButton } from './copy-markdown-button';
import { Feedback } from './feedback/feedback';
import { Recommend } from './recommend/recommend';
import { SlideLinkButton } from './slide-link-button';
import { TableOfContentsSideRail } from './table-of-contents/side-rail';
import { TableOfContents } from './table-of-contents/table-of-contents';
import { ViewReporter } from './view-reporter/view-reporter';
import { WritingModeContent } from './writing-mode/writing-mode-content';

import styles from './blog-layout.module.css';

type BlogLayoutContentProps = {
  children: ReactNode;
  slug: string;
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
  <ArticleFrame hasToc={headingTree.children.length > 0} key={slug}>
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
                    <a href={href('/tags/:id', { id: tag.id })} key={tag.id}>
                      <Badge interactive key={tag.id} label={tag.name} />
                    </a>
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
