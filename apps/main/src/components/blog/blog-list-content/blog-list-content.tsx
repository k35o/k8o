'use client';

import { useAppState } from '@k8ordo/state';
import { Stack } from '@k8ordo/ui';
import { BookTextIcon } from '@k8ordo/ui/icons';
import { useDeferredValue, useMemo } from 'react';
import type { FC } from 'react';

import { SearchableList } from '@/components/site/searchable-list/searchable-list';
import type { BlogSummary } from '@/features/blog/interface/queries';

import { blogListState } from './blog-list-state';
import { filterBlogs } from './filter-blogs';
import { groupBlogsByYear } from './group-blogs-by-year';
import { YearSection } from './year-section';

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
    <SearchableList
      countLabel={`${filteredCount.toString()}件の記事`}
      empty={
        filteredCount === 0
          ? {
              icon: <BookTextIcon size="lg" />,
              title: '条件に一致する記事がありません',
            }
          : null
      }
      onQueryChange={(typed) => {
        update({ q: typed });
      }}
      placeholder="タイトル・説明・タグで検索..."
      query={q}
      searchLabel="記事を検索"
    >
      <Stack gap="xl">
        {yearGroups.map((group) => (
          <YearSection blogs={group.blogs} key={group.year} year={group.year} />
        ))}
      </Stack>
    </SearchableList>
  );
};
