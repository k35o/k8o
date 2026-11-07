'use client';

import { useAppState } from '@k8ordo/state';
import { FlaskIcon, Heading, TextField } from '@k8ordo/ui';
import {
  playgroundCategories,
  playgroundCategoryLabels,
} from '@playgrounds/types';
import { useDeferredValue, useMemo } from 'react';
import type { FC } from 'react';

import { replayTypedValue } from '@/shared/browser/replay-typed-value';

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
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <TextField
            aria-label="Playgroundを検索"
            onChange={(e) => {
              update({ q: e.target.value });
            }}
            placeholder="タイトル・説明・カテゴリで検索..."
            ref={replayTypedValue(q, (typed) => {
              update({ q: typed });
            })}
            value={q}
          />
        </div>
        <p aria-live="polite" className={styles.count}>
          {filteredCount}件のPlayground
        </p>
      </div>
      {filteredCount === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <FlaskIcon size="lg" />
          </div>
          <p className={styles.emptyTitle}>
            条件に一致するPlaygroundがありません
          </p>
          <p className={styles.emptyText}>検索条件を変更してみてください</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};
