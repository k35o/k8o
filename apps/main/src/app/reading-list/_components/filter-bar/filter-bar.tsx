'use client';

import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Select } from '@k8o/arte-odyssey/form/select';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FC, useCallback, useMemo, useTransition } from 'react';
import { DATE_RANGE_OPTIONS, type DateRange } from '../../_utils/constants';
import { SourcePicker } from './source-picker';

type Source = {
  id: number;
  title: string;
  articleCount: number;
};

type Props = {
  sources: readonly Source[];
  resultCount: number;
};

export const FilterBar: FC<Props> = ({ sources, resultCount }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get('q') ?? '';
  const currentDateRange = (searchParams.get('date') as DateRange) || 'all';
  const currentSourceIds = useMemo(() => {
    const raw = searchParams.get('source');
    if (!raw) return [];
    return raw
      .split(',')
      .map(Number)
      .filter((n) => !Number.isNaN(n));
  }, [searchParams]);

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

  const handleSourceToggle = useCallback(
    (id: number) => {
      const next = currentSourceIds.includes(id)
        ? currentSourceIds.filter((sid) => sid !== id)
        : [...currentSourceIds, id];
      updateParams('source', next.join(','));
    },
    [currentSourceIds, updateParams],
  );

  const handleSourceClear = useCallback(() => {
    updateParams('source', '');
  }, [updateParams]);

  return (
    <fieldset
      className={`flex flex-col gap-3 ${isPending ? 'opacity-60' : ''}`}
      disabled={isPending}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
        <div className="flex items-end">
          <SourcePicker
            onClear={handleSourceClear}
            onToggle={handleSourceToggle}
            selectedIds={currentSourceIds}
            sources={sources}
          />
        </div>
      </div>
      <p className="text-fg-mute text-sm">{resultCount}件</p>
    </fieldset>
  );
};
