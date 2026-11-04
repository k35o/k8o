'use client';

import { useAppState } from '@k8ordo/state';
import { Button, Card, Drawer, SubscribeIcon } from '@k8ordo/ui';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FC, ReactNode } from 'react';

import type { ReadingList } from '@/features/reading-list/interface/queries';
import { useLiveSnapshot } from '@/shared/api/live-snapshot';
import { publicApi, readOrNull } from '@/shared/api/public-api';

import type { SortOrder } from '../constants/constants';
import { FilterBar } from '../filter-bar/filter-bar';
import { ReadingCard } from '../reading-card/reading-card';
import {
  readingListState,
  readSourceIds,
} from '../search-params/search-params';

import styles from './reading-list-content.module.css';

const loadReadingList = (): Promise<ReadingList | null> =>
  readOrNull(publicApi.public['reading-list'].$get());

const FIRST_PAINT_COUNT = 20;
const BATCH_COUNT = 50;

// 戻る・進むでは、ルーターが描いた直後に前のスクロールの位置へ戻すので、全件を一度に描いて高さをそろえておく
const isTraversing = (): boolean =>
  navigation.transition?.navigationType === 'traverse';

// 数百件を一度に描くと、DOM を作るのも並べるのも 1 つの長いタスクになる。初めは画面を埋める先頭だけを描き、
// 描き終えるたびに次の件数を足して、残りを短いタスクに分けて描く
const useShownCount = (total: number): number => {
  const [count, setCount] = useState(() =>
    isTraversing() ? Number.POSITIVE_INFINITY : FIRST_PAINT_COUNT,
  );
  useEffect(() => {
    if (count < total) {
      startTransition(() => {
        setCount((current) => current + BATCH_COUNT);
      });
    }
  }, [count, total]);
  return count;
};

export const ReadingListContent: FC<{
  readingList: ReadingList;
  filterIcon: ReactNode;
}> = ({ readingList, filterIcon }) => {
  const { articles, sources } = useLiveSnapshot(
    'reading-list',
    loadReadingList,
    readingList,
  );
  const [params, update] = useAppState(readingListState);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const query = params.q;
  const sourceIds = useMemo(
    () => readSourceIds(params.source),
    [params.source],
  );
  const sortOrder = params.sort;

  const handleQueryChange = useCallback(
    (value: string) => {
      update({ q: value });
    },
    [update],
  );

  const handleSourceChange = useCallback(
    (ids: number[]) => {
      update({ source: ids.join(',') });
    },
    [update],
  );

  const handleSortChange = useCallback(
    (value: SortOrder) => {
      update({ sort: value });
    },
    [update],
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

  const shownCount = useShownCount(filteredArticles.length);
  const shownArticles = filteredArticles.slice(0, shownCount);

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
              startIcon={filterIcon}
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
            {shownArticles.map((article) => (
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
        <FilterBar {...filterBarProps} showHeading={false} />
      </Drawer>
    </div>
  );
};
