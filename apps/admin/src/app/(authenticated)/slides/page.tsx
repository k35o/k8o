import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { SlidesContent } from './_components/slides-content/slides-content';

export default function SlidesPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        description="スライドの公開状態を管理します（タイトル/本文は MDX 管理のため slug で表示）。"
        title="スライド"
      />
      <Suspense fallback={<ContentFallback />}>
        <SlidesContent />
      </Suspense>
    </div>
  );
}
