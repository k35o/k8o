'use client';

import { EmptyState, Stack, TextField } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

import { replayTypedValue } from '@/shared/browser/replay-typed-value';

import styles from './searchable-list.module.css';

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  searchLabel: string;
  placeholder: string;
  countLabel: string;
  empty: { icon: ReactNode; title: string } | null;
  children: ReactNode;
};

export const SearchableList: FC<Props> = ({
  query,
  onQueryChange,
  searchLabel,
  placeholder,
  countLabel,
  empty,
  children,
}) => (
  <Stack gap="lg">
    <div className={styles.toolbar}>
      <div className={styles.search}>
        <TextField
          aria-label={searchLabel}
          onChange={(e) => {
            onQueryChange(e.target.value);
          }}
          placeholder={placeholder}
          ref={replayTypedValue(query, onQueryChange)}
          value={query}
        />
      </div>
      <p aria-live="polite" className={styles.count}>
        {countLabel}
      </p>
    </div>
    {empty === null ? (
      children
    ) : (
      <EmptyState
        description="検索条件を変更してみてください"
        icon={empty.icon}
        title={empty.title}
      />
    )}
  </Stack>
);
