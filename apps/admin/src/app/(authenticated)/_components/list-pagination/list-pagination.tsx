'use client';

import { Pagination } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FC } from 'react';

import { buildSearchString } from '@/shared/search-params';

type Props = {
  totalPages: number;
  currentPage: number;
};

export const ListPagination: FC<Props> = ({ totalPages, currentPage }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number): void => {
    const qs = buildSearchString(searchParams.toString(), {
      page: page === 1 ? null : String(page),
    });
    router.push(`${pathname}${qs}` as Route);
  };

  return (
    <Pagination
      currentPage={currentPage}
      onPageChange={handlePageChange}
      totalPages={totalPages}
    />
  );
};
