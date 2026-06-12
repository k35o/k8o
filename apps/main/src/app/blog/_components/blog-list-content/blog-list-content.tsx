'use client';

import { BlogIcon, TextField } from '@k8o/arte-odyssey';
import { useQueryStates } from 'nuqs';
import { type FC, useCallback, useMemo } from 'react';

import { filterBlogs } from '../../_utils/filter-blogs';
import { groupBlogsByYear } from '../../_utils/group-blogs-by-year';
import { blogListParsers } from '../../_utils/search-params';
import type { BlogSummary } from '../../_utils/types';
import { YearSection } from './year-section';

type Props = {
  blogs: readonly BlogSummary[];
};

export const BlogListContent: FC<Props> = ({ blogs }) => {
  const [params, setParams] = useQueryStates(blogListParsers);
  const query = params.q;

  const handleQueryChange = useCallback(
    (value: string) => {
      void setParams({ q: value || null });
    },
    [setParams],
  );

  const yearGroups = useMemo(
    () => groupBlogsByYear(filterBlogs(blogs, query)),
    [blogs, query],
  );

  const filteredCount = useMemo(
    () => yearGroups.reduce((total, group) => total + group.blogs.length, 0),
    [yearGroups],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="w-full max-w-xs">
          <TextField
            aria-label="記事を検索"
            onChange={(e) => {
              handleQueryChange(e.target.value);
            }}
            placeholder="タイトル・説明・タグで検索..."
            value={query}
          />
        </div>
        <p className="text-fg-mute shrink-0 text-sm">{filteredCount}件の記事</p>
      </div>
      {filteredCount === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="text-fg-subtle">
            <BlogIcon size="lg" />
          </div>
          <p className="text-fg-base text-lg font-bold">
            条件に一致する記事がありません
          </p>
          <p className="text-fg-mute text-sm">検索条件を変更してみてください</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
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
