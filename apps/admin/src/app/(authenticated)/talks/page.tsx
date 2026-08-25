import { Suspense } from 'react';

import {
  ButtonLink,
  ContentFallback,
  PageHeader,
} from '@/app/(authenticated)/_components';

import { TalksContent } from './_components/talks-content/talks-content';

export default function TalksPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        action={
          <ButtonLink
            color="primary"
            href="/talks/new"
            size="sm"
            variant="solid"
          >
            トークを追加
          </ButtonLink>
        }
        description="登壇・スライドのイベント情報を管理します"
        title="トーク"
      />
      <Suspense fallback={<ContentFallback />}>
        <TalksContent />
      </Suspense>
    </div>
  );
}
