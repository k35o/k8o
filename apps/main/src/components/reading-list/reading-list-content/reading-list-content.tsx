'use client';

import { useAppState } from '@k8ordo/state';
import { BookmarkIcon } from '@k8ordo/ui/icons';
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type { FC } from 'react';

import { SearchableList } from '@/components/site/searchable-list/searchable-list';

import { ReadingDigestList } from '../reading-digest-list/reading-digest-list';
import type { ReadingDay } from '../reading-list-source/reading-list-source';
import { ReadingRow } from '../reading-row/reading-row';
import { readingListState } from './reading-list-state';
import { searchReadings } from './search-readings';

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

/**
 * 検索していないあいだは日ごとのまとめを、検索しているあいだは当たった記事を新しい順に並べる
 */
export const ReadingListContent: FC<{ days: readonly ReadingDay[] }> = ({
  days,
}) => {
  const [{ q }, update] = useAppState(readingListState);
  const query = useDeferredValue(q);
  const isSearching = query.trim() !== '';

  const results = useMemo(
    () => (isSearching ? searchReadings(days, query) : []),
    [days, isSearching, query],
  );
  const shownCount = useShownCount(results.length);
  const count = isSearching
    ? results.length
    : days.reduce((total, day) => total + day.articleCount, 0);

  return (
    <SearchableList
      countLabel={`${count.toString()}件の記事`}
      empty={
        count === 0
          ? {
              icon: <BookmarkIcon size="lg" />,
              title: '条件に一致する記事がありません',
            }
          : null
      }
      onQueryChange={(typed) => {
        update({ q: typed });
      }}
      placeholder="題・ソースで検索..."
      query={q}
      searchLabel="記事を検索"
    >
      {isSearching ? (
        <ul className={styles.results}>
          {results.slice(0, shownCount).map((article) => (
            <ReadingRow article={article} key={article.id} showsDate />
          ))}
        </ul>
      ) : (
        <ReadingDigestList days={days} />
      )}
    </SearchableList>
  );
};
