import { Breadcrumb, Heading } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { ContentFallback } from '@/app/(authenticated)/_components';

import { NewSourceContent } from '../../_components/new-source-content/new-source-content';

export default function NewSourcePage() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/reading-list">よんでいるもの</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>ソースを追加</Breadcrumb.Item>
      </Breadcrumb.List>
      <Heading type="h1">ソースを追加</Heading>
      <Suspense fallback={<ContentFallback />}>
        <NewSourceContent />
      </Suspense>
    </div>
  );
}
