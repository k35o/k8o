'use client';

import { Select, Spinner } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ChangeEvent, type FC, useTransition } from 'react';

import { buildSearchString } from '@/shared/search-params';

type Props = {
  paramKey: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
};

export const FilterSelect: FC<Props> = ({ paramKey, label, options }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const value = searchParams.get(paramKey) ?? options[0]?.value ?? '';

  const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const qs = buildSearchString(searchParams.toString(), {
      [paramKey]: e.target.value,
      page: null,
    });
    // 遷移を transition でラップすると、再フェッチ完了まで現在の一覧が dim されたまま
    // 残り、Suspense fallback への点滅を防げる。isPending で操作中も表示する。
    startTransition(() => {
      router.push(`${pathname}${qs}` as Route);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-busy={isPending}
        aria-label={label}
        disabled={isPending}
        onChange={handleChange}
        options={options}
        value={value}
      />
      {isPending ? <Spinner label="絞り込み中" size="sm" /> : null}
    </div>
  );
};
