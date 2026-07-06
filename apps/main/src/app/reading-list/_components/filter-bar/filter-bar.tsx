'use client';

import {
  Autocomplete,
  FormControl,
  Heading,
  Select,
  Separator,
  TextField,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

import {
  isSortOrder,
  SORT_OPTIONS,
  type SortOrder,
} from '../../_utils/constants';

type Source = {
  id: number;
  title: string;
  articleCount: number;
};

type Props = {
  sources: readonly Source[];
  query: string;
  onQueryChange: (value: string) => void;
  sortOrder: SortOrder;
  onSortChange: (value: SortOrder) => void;
  sourceIds: number[];
  onSourceChange: (ids: number[]) => void;
};

export const FilterBar: FC<Props> = ({
  sources,
  query,
  onQueryChange,
  sortOrder,
  onSortChange,
  sourceIds,
  onSourceChange,
}) => {
  const sourceOptions = sources
    .filter(
      (source) => source.articleCount > 0 || sourceIds.includes(source.id),
    )
    .map((source) => ({
      value: String(source.id),
      label: `${source.title} (${source.articleCount})`,
    }));

  return (
    <div className="flex flex-col gap-5">
      <Heading type="h4">絞り込み</Heading>
      <FormControl
        label="検索"
        renderInput={(props) => (
          <TextField
            {...props}
            onChange={(e) => {
              onQueryChange(e.target.value);
            }}
            placeholder="記事を検索..."
            value={query}
          />
        )}
      />
      <FormControl
        label="並び順"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <Select
            {...props}
            onChange={(e) => {
              if (isSortOrder(e.target.value)) {
                onSortChange(e.target.value);
              }
            }}
            options={SORT_OPTIONS}
            value={sortOrder}
          />
        )}
      />
      <Separator color="subtle" />
      <FormControl
        helpText="複数のソースを選択できます"
        label="ソース"
        renderInput={(props) => (
          <Autocomplete
            {...props}
            onChange={(values) => {
              onSourceChange(values.map(Number));
            }}
            options={sourceOptions}
            value={sourceIds.map(String)}
          />
        )}
      />
    </div>
  );
};
