'use client';

import { Select } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ChangeEvent, FC } from 'react';

import { buildSearchString } from '@/shared/search-params';

type Props = {
  paramKey: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
};

/**
 * URL パラメータを切り替える絞り込みセレクト。変更時に page を 1 に戻す。
 */
export const FilterSelect: FC<Props> = ({ paramKey, label, options }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramKey) ?? options[0]?.value ?? '';

  const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const qs = buildSearchString(searchParams.toString(), {
      [paramKey]: e.target.value,
      page: null,
    });
    router.push(`${pathname}${qs}` as Route);
  };

  return (
    <Select
      aria-label={label}
      onChange={handleChange}
      options={options}
      value={value}
    />
  );
};
