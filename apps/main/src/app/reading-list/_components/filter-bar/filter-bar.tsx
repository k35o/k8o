'use client';

import { Checkbox } from '@k8o/arte-odyssey/form/checkbox';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Select } from '@k8o/arte-odyssey/form/select';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { type FC, useMemo } from 'react';
import {
  DATE_RANGE_OPTIONS,
  type DateRange,
  isDateRange,
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
  sourceIds: number[];
  onSourceToggle: (id: number) => void;
};

export const FilterBar: FC<Props> = ({
  sources,
  query,
  onQueryChange,
  dateRange,
  onDateChange,
  sourceIds,
  onSourceToggle,
}) => {
  const selectedSet = useMemo(() => new Set(sourceIds), [sourceIds]);

  return (
    <div className="flex flex-col gap-6">
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
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-bold text-fg-base text-sm">ソース</legend>
        <ul className="flex flex-col gap-1">
          {sources.map((source) => (
            <li className="flex items-center justify-between" key={source.id}>
              <Checkbox
                label={source.title}
                onChange={() => {
                  onSourceToggle(source.id);
                }}
                value={selectedSet.has(source.id)}
              />
              <span className="shrink-0 text-fg-mute text-xs tabular-nums">
                {source.articleCount}
              </span>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
};
