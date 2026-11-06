'use client';

import { useAppState } from '@k8ordo/state';
import { Button, Card, Drawer, SubscribeIcon } from '@k8ordo/ui';
import {
  startTransition,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type { FC, ReactNode } from 'react';

import type { SortOrder } from '../constants/constants';
import { FilterBar } from '../filter-bar/filter-bar';
import { ReadingCard } from '../reading-card/reading-card';
import type { ReadingList } from '../reading-list-source/reading-list-source';
import {
  readingListState,
  readSourceIds,
} from '../search-params/search-params';

import styles from './reading-list-content.module.css';

const FIRST_PAINT_COUNT = 20;
const BATCH_COUNT = 50;

const subscribeNavigation = (onChange: () => void): (() => void) => {
  // navigation.transition は、navigatesuccess と navigateerror を配り終えてから null になる
  const onSettled = (): void => {
    queueMicrotask(onChange);
  };
  navigation.addEventListener('currententrychange', onChange);
  navigation.addEventListener('navigatesuccess', onSettled);
  navigation.addEventListener('navigateerror', onSettled);
  return () => {
    navigation.removeEventListener('currententrychange', onChange);
    navigation.removeEventListener('navigatesuccess', onSettled);
    navigation.removeEventListener('navigateerror', onSettled);
  };
};

const isTraversing = (): boolean =>
  navigation.transition?.navigationType === 'traverse';

// 数百件を一度に描くと、DOM を作るのも並べるのも 1 つの長いタスクになる。初めは画面を埋める先頭だけを描き、
// 残りはフレームごとに次の件数を足して、短いタスクに分けて描く。戻る・進むでは、ルーターが描いた直後に
// 前のスクロールの位置へ戻すので、全件を一度に描いて高さをそろえておく
const useShownCount = (total: number): number => {
  const traversing = useSyncExternalStore(subscribeNavigation, isTraversing);
  const [count, setCount] = useState(
    traversing ? Number.POSITIVE_INFINITY : FIRST_PAINT_COUNT,
  );
  const isAllShown = count >= total;
  // transition の更新は、描き終える前に同じ state へ重ねたものとまとめて描かれる。前の分を描き終える前に
  // 次のフレームが来ても 1 回分だけ足すよう、足す前の値を描き終えた件数から取る
  const addBatch = useEffectEvent((): void => {
    startTransition(() => {
      setCount(count + BATCH_COUNT);
    });
  });
  useEffect(() => {
    if (isAllShown) {
      return undefined;
    }
    let frame = requestAnimationFrame(function onFrame(): void {
      addBatch();
      frame = requestAnimationFrame(onFrame);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isAllShown]);
  return count;
};

export const ReadingListContent: FC<{
  readingList: ReadingList;
  filterIcon: ReactNode;
}> = ({ readingList, filterIcon }) => {
  const { articles, sources } = readingList;
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
