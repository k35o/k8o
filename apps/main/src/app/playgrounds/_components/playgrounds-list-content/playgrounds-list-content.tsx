'use client';

import { FlaskIcon, Heading, TextField } from '@k8o/arte-odyssey';
import { useQueryStates } from 'nuqs';
import { useMemo } from 'react';
import type { FC } from 'react';

import {
  playgroundCategories,
  playgroundCategoryLabels,
} from '@/app/_components/playgrounds/types';

import { filterPlaygrounds } from '../../_utils/filter-playgrounds';
import { playgroundListParsers } from '../../_utils/search-params';
import type { PlaygroundSummary } from '../../_utils/types';
import { PlaygroundCard } from './playground-card';

type Props = {
  playgrounds: readonly PlaygroundSummary[];
};

export const PlaygroundsListContent: FC<Props> = ({ playgrounds }) => {
  const [params, setParams] = useQueryStates(playgroundListParsers);
  const query = params.q;

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="w-full max-w-xs">
          <TextField
            aria-label="Playgroundを検索"
            onChange={(e) => {
              void setParams({ q: e.target.value || null });
            }}
            placeholder="タイトル・説明・カテゴリで検索..."
            value={query}
          />
        </div>
        <p aria-live="polite" className="text-fg-mute shrink-0 text-sm">
          {filteredCount}件のPlayground
        </p>
      </div>
      {filteredCount === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="text-fg-subtle">
            <FlaskIcon size="lg" />
          </div>
          <p className="text-fg-base text-lg font-bold">
            条件に一致するPlaygroundがありません
          </p>
          <p className="text-fg-mute text-sm">検索条件を変更してみてください</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {categoryGroups.map((group) => (
            <section className="flex flex-col gap-4" key={group.category}>
              <div className="flex items-baseline gap-3">
                <Heading type="h2">
                  {playgroundCategoryLabels[group.category]}
                </Heading>
                <span className="text-fg-mute text-sm">
                  {group.playgrounds.length}件
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
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
