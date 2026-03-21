'use client';

import {
  Button,
  Drawer,
  FormControl,
  ListIcon,
  Select,
} from '@k8o/arte-odyssey';
import { useQueryStates } from 'nuqs';
import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';
import type { DateRange, SortOrder } from '../../_utils/constants';
import { SORT_OPTIONS } from '../../_utils/constants';
import { readingListParsers } from '../../_utils/search-params';
import { FilterBar } from '../filter-bar';

type ArticleMeta = {
  id: number;
  title: string;
  publishedAt: string;
  sourceId: number;
};

type Source = {
  id: number;
  title: string;
  articleCount: number;
};

type Props = {
  articles: readonly ArticleMeta[];
  sources: readonly Source[];
  cards: Readonly<Record<number, ReactNode>>;
};

const getDateThreshold = (range: DateRange): Date => {
  const now = new Date();
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return new Date(0);
  }
};

export const ReadingListContent: FC<Props> = ({ articles, sources, cards }) => {
  const [params, setParams] = useQueryStates(readingListParsers);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const query = params.q;
  const sourceIds = params.source;
  const dateRange = params.date;
  const sortOrder = params.sort;

  const handleQueryChange = useCallback(
    (value: string) => {
      setParams({ q: value || null });
    },
    [setParams],
  );

  const handleSourceToggle = useCallback(
    (id: number) => {
      const next = sourceIds.includes(id)
        ? sourceIds.filter((sid) => sid !== id)
        : [...sourceIds, id];
      setParams({ source: next.length > 0 ? next : null });
    },
    [sourceIds, setParams],
  );

  const handleDateChange = useCallback(
    (value: DateRange) => {
      setParams({ date: value === 'all' ? null : value });
    },
    [setParams],
  );

  const handleSortChange = useCallback(
    (value: SortOrder) => {
      setParams({ sort: value === 'newest' ? null : value });
    },
    [setParams],
  );

  const dateThreshold = useMemo(() => getDateThreshold(dateRange), [dateRange]);

  const filteredArticles = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const filtered = articles.filter((article) => {
      if (lowerQuery && !article.title.toLowerCase().includes(lowerQuery)) {
        return false;
      }
      if (sourceIds.length > 0 && !sourceIds.includes(article.sourceId)) {
        return false;
      }
      if (
        dateRange !== 'all' &&
        new Date(article.publishedAt) < dateThreshold
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const diff =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return sortOrder === 'oldest' ? -diff : diff;
    });
  }, [articles, query, sourceIds, dateRange, dateThreshold, sortOrder]);

  const filterBarProps = {
    dateRange,
    onDateChange: handleDateChange,
    onQueryChange: handleQueryChange,
    onSourceToggle: handleSourceToggle,
    query,
    sourceIds,
    sources,
  };

  return (
    <div className="flex flex-col gap-6 rounded-md bg-bg-base p-6 lg:flex-row xl:-mx-36">
      <aside className="hidden w-60 shrink-0 lg:block">
        <FilterBar {...filterBarProps} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-fg-mute text-sm">{filteredArticles.length}件</p>
            <div className="lg:hidden">
              <Button
                onClick={() => {
                  setIsDrawerOpen(true);
                }}
                size="sm"
                startIcon={<ListIcon />}
                variant="outlined"
              >
                フィルター
              </Button>
            </div>
          </div>
          <div className="w-32">
            <FormControl
              label="並び順"
              renderInput={({ id, describedbyId, ...rest }) => (
                <Select
                  {...rest}
                  describedbyId={describedbyId}
                  id={id}
                  onChange={(e) => {
                    handleSortChange(e.target.value as SortOrder);
                  }}
                  options={SORT_OPTIONS}
                  value={sortOrder}
                />
              )}
            />
          </div>
        </div>
        {filteredArticles.length === 0 ? (
          <p className="text-fg-mute text-sm">
            条件に一致する記事がありません。
          </p>
        ) : (
          <div className="grid grid-cols-auto-fill-60 gap-3">
            {filteredArticles.map((article) => cards[article.id])}
          </div>
        )}
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
        title="フィルター"
      >
        <FilterBar {...filterBarProps} />
      </Drawer>
    </div>
  );
};
