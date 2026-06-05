import { Breadcrumb, Heading } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { ContentFallback } from '@/app/(authenticated)/_components';

import { NewTalkContent } from '../_components/new-talk-content/new-talk-content';

export default function NewTalkPage() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/talks">トーク</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>トークを追加</Breadcrumb.Item>
      </Breadcrumb.List>
      <Heading type="h1">トークを追加</Heading>
      <Suspense fallback={<ContentFallback />}>
        <NewTalkContent />
      </Suspense>
    </div>
  );
}
