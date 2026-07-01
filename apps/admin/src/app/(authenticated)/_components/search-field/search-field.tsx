'use client';

import { Spinner, TextField } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type ChangeEvent,
  type FC,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import { buildSearchString } from '@/shared/search-params';

type Props = {
  paramKey?: string;
  placeholder?: string;
};

const DEBOUNCE_MS = 300;

export const SearchField: FC<Props> = ({
  paramKey = 'q',
  placeholder = '検索',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const urlValue = searchParams.get(paramKey) ?? '';
  const [value, setValue] = useState(urlValue);
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);
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
  // 自分のデバウンス更新では URL 値 === value となり setValue は no-op になる。
  if (urlValue !== prevUrlValue) {
    setPrevUrlValue(urlValue);
    setValue(urlValue);
  }

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
      // transition でラップして、再フェッチ中も入力欄とフォーカスを保ったまま現在の一覧を
      // 維持する（Suspense fallback への点滅を防ぐ）。入力は妨げず、横にスピナーで状態を示す。
      startTransition(() => {
        router.push(`${pathname}${qs}` as Route);
      });
    }, DEBOUNCE_MS);
  };

  return (
    <div className="flex items-center gap-2">
      <TextField
        aria-busy={isPending}
        aria-label={placeholder}
        onChange={handleChange}
        placeholder={placeholder}
        // ArteOdyssey の TextField は幅ユーティリティを持たないため、
        // size 属性で実用的な横幅を確保する。
        size={32}
        value={value}
      />
      {isPending ? <Spinner label="検索中" size="sm" /> : null}
    </div>
  );
};
