import { Breadcrumb, Heading } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { ContentFallback } from '@/app/(authenticated)/_components';

import { EditArticleContent } from '../../_components/edit-article-content/edit-article-content';

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/reading-list">よんでいるもの</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>記事を編集</Breadcrumb.Item>
      </Breadcrumb.List>
      <Heading type="h1">記事を編集</Heading>
      <Suspense fallback={<ContentFallback />}>
        <EditArticleContent params={params} />
      </Suspense>
    </div>
  );
}
