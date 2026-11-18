'use client';

import { useAppState } from '@k8ordo/state';
import { Heading } from '@k8ordo/ui';
import { FlaskIcon } from '@k8ordo/ui/icons';
import {
  playgroundCategories,
  playgroundCategoryLabels,
} from '@playgrounds/types';
import { useDeferredValue, useMemo } from 'react';
import type { FC } from 'react';

import { SearchableList } from '@/components/site/searchable-list/searchable-list';

import { filterPlaygrounds } from './filter-playgrounds';
import { PlaygroundCard } from './playground-card';
import { playgroundsState } from './playgrounds-state';
import type { PlaygroundSummary } from './types';

import styles from './playgrounds-list-content.module.css';

type Props = {
  playgrounds: readonly PlaygroundSummary[];
};

export const PlaygroundsListContent: FC<Props> = ({ playgrounds }) => {
  const [{ q }, update] = useAppState(playgroundsState);
  const query = useDeferredValue(q);

  const categoryGroups = useMemo(() => {
    const filtered = filterPlaygrounds(playgrounds, query);
    return playgroundCategories
      .map((category) => ({
        category,
        playgrounds: filtered.filter(
          (playground) => playground.category === category,
        ),
      }))
      .filter((group) => group.playgrounds.length > 0);
  }, [playgrounds, query]);

  const filteredCount = useMemo(
    () =>
      categoryGroups.reduce(
        (total, group) => total + group.playgrounds.length,
        0,
      ),
    [categoryGroups],
  );

  return (
    <SearchableList
      countLabel={`${filteredCount.toString()}件のPlayground`}
      empty={
        filteredCount === 0
          ? {
              icon: <FlaskIcon size="lg" />,
              title: '条件に一致するPlaygroundがありません',
            }
          : null
      }
      onQueryChange={(typed) => {
        update({ q: typed });
      }}
      placeholder="タイトル・説明・カテゴリで検索..."
      query={q}
      searchLabel="Playgroundを検索"
    >
      <div className={styles.groups}>
        {categoryGroups.map((group) => (
          <section className={styles.group} key={group.category}>
            <div className={styles.groupHeader}>
              <Heading level="h2">
                {playgroundCategoryLabels[group.category]}
              </Heading>
              <span className={styles.groupCount}>
                {group.playgrounds.length}件
              </span>
            </div>
            <div className={styles.grid}>
              {group.playgrounds.map((playground) => (
                <PlaygroundCard key={playground.id} playground={playground} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </SearchableList>
  );
};
