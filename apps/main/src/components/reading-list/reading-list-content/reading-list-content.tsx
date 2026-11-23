'use client';

import { useAppState } from '@k8ordo/state';
import { BookmarkIcon } from '@k8ordo/ui/icons';
import { useDeferredValue, useMemo } from 'react';
import type { FC } from 'react';

import { SearchableList } from '@/components/site/searchable-list/searchable-list';

import { ReadingDigestList } from '../reading-digest-list/reading-digest-list';
import type { ReadingDay } from '../reading-list-source/reading-list-source';
import { ReadingSearchResults } from '../reading-search-results/reading-search-results';
import { readingListState } from './reading-list-state';
import { searchReadings } from './search-readings';

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
        <ReadingSearchResults articles={results} />
      ) : (
        <ReadingDigestList days={days} />
      )}
    </SearchableList>
  );
};
