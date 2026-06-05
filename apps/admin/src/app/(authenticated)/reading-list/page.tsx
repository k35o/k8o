import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { ReadingListContent } from './_components/reading-list-content/reading-list-content';

export default function ReadingListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="RSSフィードと手動ソースから集めた記事を管理します"
        title="よんでいるもの"
      />
      <Suspense fallback={<ContentFallback />}>
        <ReadingListContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
