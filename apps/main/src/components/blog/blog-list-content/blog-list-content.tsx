'use client';

import { useAppState } from '@k8ordo/state';
import { BlogIcon, TextField } from '@k8ordo/ui';
import { useDeferredValue, useMemo } from 'react';
import type { FC } from 'react';

import { replayTypedValue } from '@/shared/browser/replay-typed-value';

import { blogListState } from './blog-list-state';
import { filterBlogs } from './filter-blogs';
import { groupBlogsByYear } from './group-blogs-by-year';
import type { BlogSummary } from './types';
import { YearSection } from './year-section';

import styles from './blog-list-content.module.css';

type Props = {
  blogs: readonly BlogSummary[];
};

export const BlogListContent: FC<Props> = ({ blogs }) => {
  const [{ q }, update] = useAppState(blogListState);
  const query = useDeferredValue(q);

  const yearGroups = useMemo(
    () => groupBlogsByYear(filterBlogs(blogs, query)),
    [blogs, query],
  );

  const filteredCount = useMemo(
    () => yearGroups.reduce((total, group) => total + group.blogs.length, 0),
    [yearGroups],
  );

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            aria-label="記事を検索"
            onChange={(e) => {
              update({ q: e.target.value });
            }}
            placeholder="タイトル・説明・タグで検索..."
            ref={replayTypedValue(q, (typed) => {
              update({ q: typed });
            })}
            value={q}
          />
        </div>
        <p aria-live="polite" className={styles.count}>
          {filteredCount}件の記事
        </p>
      </div>
      {filteredCount === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <BlogIcon size="lg" />
          </div>
          <p className={styles.emptyTitle}>条件に一致する記事がありません</p>
          <p className={styles.emptyText}>検索条件を変更してみてください</p>
        </div>
      ) : (
        <div className={styles.years}>
          {yearGroups.map((group) => (
            <YearSection
              blogs={group.blogs}
              key={group.year}
              year={group.year}
            />
          ))}
        </div>
      )}
    </div>
  );
};
