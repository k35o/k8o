import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { CommentsContent } from './_components/comments-content/comments-content';

export default function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="ブログ記事のフィードバックフォーム経由で届いたお問い合わせとコメントを管理します。"
        title="お問い合わせ"
      />
      <Suspense fallback={<ContentFallback />}>
        <CommentsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
