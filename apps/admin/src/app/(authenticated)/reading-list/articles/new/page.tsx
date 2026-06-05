import { Breadcrumb, Card, Heading } from '@k8o/arte-odyssey';

import { createArticle } from '@/features/reading-list/interface/article-actions';
import { getReadingListContentData } from '@/features/reading-list/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { ArticleForm } from '../../_components/article-form/article-form';

export default async function NewArticlePage() {
  await verifySession();
  const { sources } = await getReadingListContentData();

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
      <Card appearance="shadow">
        <div className="p-8">
          <ArticleForm
            action={createArticle}
            sources={sources.map((s) => ({ id: s.id, title: s.title }))}
          />
        </div>
      </Card>
    </div>
  );
}
