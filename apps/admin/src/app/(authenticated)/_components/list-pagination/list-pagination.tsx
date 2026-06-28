'use client';

import { Pagination } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FC, useTransition } from 'react';

import { buildSearchString } from '@/shared/search-params';

type Props = {
  totalPages: number;
  currentPage: number;
};

export const ListPagination: FC<Props> = ({ totalPages, currentPage }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number): void => {
    const qs = buildSearchString(searchParams.toString(), {
      page: page === 1 ? null : String(page),
    });
    // transition でラップし、ページ取得中も現在の一覧を維持したまま操作を無効化する。
    startTransition(() => {
      router.push(`${pathname}${qs}` as Route);
    });
  };

  return (
    <Pagination
      currentPage={currentPage}
      disabled={isPending}
      onPageChange={handlePageChange}
      totalPages={totalPages}
    />
  );
};
