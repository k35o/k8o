'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Select } from '@k8o/arte-odyssey/form/select';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FC, useCallback, useTransition } from 'react';
import { DATE_RANGE_OPTIONS, type DateRange } from '../../_utils/constants';

type Source = {
  id: number;
  title: string;
};

type Props = {
  sources: readonly Source[];
};

export const FilterBar: FC<Props> = ({ sources }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSource = searchParams.get('source') ?? '';
  const currentQuery = searchParams.get('q') ?? '';
  const currentDateRange = (searchParams.get('date') as DateRange) || 'all';

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      startTransition(() => {
        const query = params.toString();
        router.replace(query ? `?${query}` : '?', { scroll: false });
      });
    },
    [router, searchParams],
  );

  const sourceOptions = [
    { value: '', label: 'すべてのソース' },
    ...sources.map((s) => ({
      value: String(s.id),
      label: s.title,
    })),
  ];

  return (
    <fieldset
      className={`flex flex-col gap-4 sm:flex-row sm:items-end ${isPending ? 'opacity-60' : ''}`}
      disabled={isPending}
    >
      <div className="flex-1">
        <FormControl
          label="名前検索"
          renderInput={(props) => (
            <TextField
              {...props}
              onChange={(e) => {
                updateParams('q', e.target.value);
              }}
              placeholder="記事を検索..."
              value={currentQuery}
            />
          )}
        />
      </div>
      <div className="w-full sm:w-48">
        <FormControl
          label="ソース"
          renderInput={({ id, describedbyId, ...rest }) => (
            <Select
              {...rest}
              describedbyId={describedbyId}
              id={id}
              onChange={(e) => {
                updateParams('source', e.target.value);
              }}
              options={sourceOptions}
              value={currentSource}
            />
          )}
        />
      </div>
      <div className="w-full sm:w-56">
        <FormControl
          label="期間"
          renderInput={({ id, describedbyId, ...rest }) => (
            <Select
              {...rest}
              describedbyId={describedbyId}
              id={id}
              onChange={(e) => {
                updateParams('date', e.target.value);
              }}
              options={DATE_RANGE_OPTIONS}
              value={currentDateRange}
            />
          )}
        />
      </div>
    </fieldset>
  );
};
