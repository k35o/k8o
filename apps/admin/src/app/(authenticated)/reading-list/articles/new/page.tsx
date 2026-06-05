import { Breadcrumb, Heading } from '@k8o/arte-odyssey';
import { Suspense } from 'react';

import { ContentFallback } from '@/app/(authenticated)/_components';

import { NewArticleContent } from '../../_components/new-article-content/new-article-content';

export default function NewArticlePage() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/reading-list">よんでいるもの</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>記事を追加</Breadcrumb.Item>
      </Breadcrumb.List>
      <Heading type="h1">記事を追加</Heading>
      <Suspense fallback={<ContentFallback />}>
        <NewArticleContent />
      </Suspense>
    </div>
  );
}
