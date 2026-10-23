'use client';

import { Button, Card, Drawer, ListIcon, SubscribeIcon } from '@k8ordo/ui';
import { useQueryStates } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';
import type { FC } from 'react';

import type { ReadingList } from '@/features/reading-list/interface/queries';
import { useLiveSnapshot } from '@/shared/api/live-snapshot';
import { publicApi, readOrNull } from '@/shared/api/public-api';

import type { SortOrder } from '../../_utils/constants';
import { readingListParsers } from '../../_utils/search-params';
import { FilterBar } from '../filter-bar';
import { ReadingCard } from '../reading-card';

import styles from './reading-list-content.module.css';

const loadReadingList = (): Promise<ReadingList | null> =>
  readOrNull(publicApi.public['reading-list'].$get());

export const ReadingListContent: FC<{ readingList: ReadingList }> = ({
  readingList,
}) => {
  const { articles, sources } = useLiveSnapshot(
    'reading-list',
    loadReadingList,
    readingList,
  );
  const [params, setParams] = useQueryStates(readingListParsers);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const query = params.q;
  const sourceIds = params.source;
  const sortOrder = params.sort;

  const handleQueryChange = useCallback(
    (value: string) => {
      void setParams({ q: value || null });
    },
    [setParams],
  );

  const handleSourceChange = useCallback(
    (ids: number[]) => {
      void setParams({ source: ids.length > 0 ? ids : null });
    },
    [setParams],
  );

  const handleSortChange = useCallback(
    (value: SortOrder) => {
      void setParams({ sort: value === 'newest' ? null : value });
    },
    [setParams],
  );

  const filteredArticles = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const filtered = articles.filter((article) => {
      if (lowerQuery && !article.title.toLowerCase().includes(lowerQuery)) {
        return false;
      }
      if (sourceIds.length > 0 && !sourceIds.includes(article.source.id)) {
        return false;
      }
      return true;
    });

    return [...filtered].toSorted((a, b) => {
      const diff =
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return sortOrder === 'oldest' ? -diff : diff;
    });
  }, [articles, query, sourceIds, sortOrder]);

  const articleCountBySource = new Map<number, number>();
  for (const article of articles) {
    const count = articleCountBySource.get(article.source.id) ?? 0;
    articleCountBySource.set(article.source.id, count + 1);
  }

  const filterBarProps = {
    onQueryChange: handleQueryChange,
    onSortChange: handleSortChange,
    onSourceChange: handleSourceChange,
    query,
    sortOrder,
    sourceIds,
    sources: sources.map((source) => ({
      id: source.id,
      title: source.title,
      articleCount: articleCountBySource.get(source.id) ?? 0,
    })),
  };

  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <Card variant="shadow">
          <div className={styles.filter}>
            <FilterBar {...filterBarProps} />
          </div>
        </Card>
      </aside>
      <div className={styles.main}>
        <div className={styles.toolbar}>
          <p className={styles.count}>
            {filteredArticles.length}件の記事
            {sourceIds.length > 0 &&
              ` / ${sourceIds.length}件のソースで絞り込み中`}
          </p>
          <div className={styles.drawerButton}>
            <Button
              onClick={() => {
                setIsDrawerOpen(true);
              }}
              size="sm"
              startIcon={<ListIcon />}
              variant="outline"
            >
              絞り込み
            </Button>
          </div>
        </div>
        {filteredArticles.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <SubscribeIcon size="lg" />
            </div>
            <p className={styles.emptyTitle}>条件に一致する記事がありません</p>
            <p className={styles.emptyText}>
              検索条件やソースの選択を変更してみてください
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredArticles.map((article) => (
              <ReadingCard
                description={article.description}
                imageUrl={article.imageUrl}
                key={article.id}
                publishedAt={article.publishedAt}
                sourceTitle={article.source.title}
                summary={article.summary}
                title={article.title}
                url={article.url}
              />
            ))}
          </div>
        )}
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
        }}
        title="絞り込み"
      >
        <FilterBar {...filterBarProps} />
      </Drawer>
    </div>
  );
};
