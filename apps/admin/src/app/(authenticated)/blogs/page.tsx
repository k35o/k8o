import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { BlogsContent } from './_components/blogs-content/blogs-content';

export default function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="記事の公開状態・閲覧数・コメント数を管理します（タイトル/本文は MDX 管理のため slug で表示）。"
        title="ブログ"
      />
      <Suspense fallback={<ContentFallback />}>
        <BlogsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
