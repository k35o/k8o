'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Drawer } from '@k8o/arte-odyssey/drawer';
import { ListIcon } from '@k8o/arte-odyssey/icons';
import { useQueryStates } from 'nuqs';
import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';
import type { DateRange } from '../../_utils/constants';
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

  const dateThreshold = useMemo(() => getDateThreshold(dateRange), [dateRange]);
  const lowerQuery = query.toLowerCase();

  const visibleIds = useMemo(() => {
    const ids = new Set<number>();
    for (const article of articles) {
      if (lowerQuery && !article.title.toLowerCase().includes(lowerQuery)) {
        continue;
      }
      if (sourceIds.length > 0 && !sourceIds.includes(article.sourceId)) {
        continue;
      }
      if (
        dateRange !== 'all' &&
        new Date(article.publishedAt) < dateThreshold
      ) {
        continue;
      }
      ids.add(article.id);
    }
    return ids;
  }, [articles, lowerQuery, sourceIds, dateRange, dateThreshold]);

  const filterBarProps = {
    dateRange,
    onDateChange: handleDateChange,
    onQueryChange: handleQueryChange,
    onSourceToggle: handleSourceToggle,
    query,
    sourceIds,
    sources,
  } as const;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="hidden w-60 shrink-0 lg:block">
        <FilterBar {...filterBarProps} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-fg-mute text-sm">{visibleIds.size}件</p>
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
        {visibleIds.size === 0 ? (
          <p className="text-fg-mute text-sm">
            条件に一致する記事がありません。
          </p>
        ) : (
          <div className="grid grid-cols-auto-fill-80 gap-3">
            {articles.map((article) =>
              visibleIds.has(article.id) ? cards[article.id] : null,
            )}
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
