import { Suspense } from 'react';

import { ContentFallback } from '@/app/(authenticated)/_components';

import { EditTalkContent } from '../_components/edit-talk-content/edit-talk-content';

export default function EditTalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<ContentFallback />}>
        <EditTalkContent params={params} />
      </Suspense>
    </div>
  );
}
