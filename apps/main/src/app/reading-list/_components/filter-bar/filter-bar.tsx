'use client';

import {
  Checkbox,
  FormControl,
  Heading,
  Select,
  Separator,
  TextField,
} from '@k8o/arte-odyssey';
import { type FC, useMemo } from 'react';
import {
  DATE_RANGE_OPTIONS,
  type DateRange,
  isDateRange,
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
  dateRange: DateRange;
  onDateChange: (value: DateRange) => void;
  sortOrder: SortOrder;
  onSortChange: (value: SortOrder) => void;
  sourceIds: number[];
  onSourceToggle: (id: number) => void;
};

export const FilterBar: FC<Props> = ({
  sources,
  query,
  onQueryChange,
  dateRange,
  onDateChange,
  sortOrder,
  onSortChange,
  sourceIds,
  onSourceToggle,
}) => {
  const selectedSet = useMemo(() => new Set(sourceIds), [sourceIds]);

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
        label="期間"
        renderInput={({ id, describedbyId, ...rest }) => (
          <Select
            {...rest}
            describedbyId={describedbyId}
            id={id}
            onChange={(e) => {
              if (isDateRange(e.target.value)) {
                onDateChange(e.target.value);
              }
            }}
            options={DATE_RANGE_OPTIONS}
            value={dateRange}
          />
        )}
      />
      <FormControl
        label="並び順"
        renderInput={({ id, describedbyId, ...rest }) => (
          <Select
            {...rest}
            describedbyId={describedbyId}
            id={id}
            onChange={(e) => {
              onSortChange(e.target.value as SortOrder);
            }}
            options={SORT_OPTIONS}
            value={sortOrder}
          />
        )}
      />
      <Separator color="subtle" />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-medium text-fg-mute text-xs">
          ソース
        </legend>
        <ul className="flex flex-col gap-1">
          {sources
            .filter((source) => source.articleCount > 0)
            .map((source) => (
              <li key={source.id}>
                <Checkbox
                  label={`${source.title} (${source.articleCount})`}
                  onChange={() => {
                    onSourceToggle(source.id);
                  }}
                  value={selectedSet.has(source.id)}
                />
              </li>
            ))}
        </ul>
      </fieldset>
    </div>
  );
};
