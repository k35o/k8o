import { PageHeader } from '@/app/(authenticated)/_components';
import { verifySession } from '@/shared/auth/verify-session';
import { firstParam, parsePageParam } from '@/shared/search-params';

import { ReadingListContent } from './_components/reading-list-content/reading-list-content';

export default async function ReadingListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await verifySession();

  const sp = await searchParams;
  const q = firstParam(sp['q']) ?? '';
  const page = parsePageParam(firstParam(sp['page']));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="RSSフィードと手動ソースから集めた記事を管理します"
        title="よんでいるもの"
      />
      <ReadingListContent page={page} q={q} />
    </div>
  );
}
