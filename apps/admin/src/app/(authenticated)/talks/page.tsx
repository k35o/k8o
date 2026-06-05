import { Suspense } from 'react';

import { ContentFallback, PageHeader } from '@/app/(authenticated)/_components';

import { AddTalkLink } from './_components/add-talk-link';
import { TalksContent } from './_components/talks-content/talks-content';

export default function TalksPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        action={<AddTalkLink />}
        description="登壇・スライドのイベント情報を管理します"
        title="トーク"
      />
      <Suspense fallback={<ContentFallback />}>
        <TalksContent />
      </Suspense>
    </div>
  );
}
