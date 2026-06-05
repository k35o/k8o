'use client';

import { TextField } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ChangeEvent, type FC, useEffect, useRef, useState } from 'react';

import { buildSearchString } from '@/shared/search-params';

type Props = {
  paramKey?: string;
  placeholder?: string;
};

const DEBOUNCE_MS = 300;

/**
 * URL の検索パラメータ(既定 `q`)をデバウンス付きで更新する検索ボックス。
 * 入力のたびに page を 1 に戻す。
 */
export const SearchField: FC<Props> = ({
  paramKey = 'q',
  placeholder = '検索',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramKey) ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  // ブラウザの戻る/進む等で URL が外部から変わったら入力値を同期する。
  // 自分のデバウンス更新では URL 値 === value となり no-op になる。
  useEffect(() => {
    setValue(searchParams.get(paramKey) ?? '');
  }, [searchParams, paramKey]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const next = e.target.value;
    setValue(next);
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      const qs = buildSearchString(searchParams.toString(), {
        [paramKey]: next,
        page: null,
      });
      router.push(`${pathname}${qs}` as Route);
    }, DEBOUNCE_MS);
  };

  return (
    <TextField
      aria-label={placeholder}
      onChange={handleChange}
      placeholder={placeholder}
      // ArteOdyssey の TextField は幅ユーティリティを持たないため、
      // size 属性で実用的な横幅を確保する。
      size={32}
      value={value}
    />
  );
};
