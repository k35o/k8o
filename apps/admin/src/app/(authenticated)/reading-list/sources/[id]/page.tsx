import { Suspense } from 'react';

import { ContentFallback } from '@/app/(authenticated)/_components';

import { EditSourceContent } from '../../_components/edit-source-content/edit-source-content';

export default function EditSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<ContentFallback />}>
        <EditSourceContent params={params} />
      </Suspense>
    </div>
  );
}
