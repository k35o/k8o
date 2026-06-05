import { Breadcrumb, Card, Heading } from '@k8o/arte-odyssey';
import { notFound } from 'next/navigation';

import { updateArticle } from '@/features/reading-list/interface/article-actions';
import { getArticleForEdit } from '@/features/reading-list/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { ArticleForm } from '../../_components/article-form/article-form';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const article = await getArticleForEdit(id);

  if (!article) {
    notFound();
  }

  const action = updateArticle.bind(null, article.id);

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
      <Card appearance="shadow">
        <div className="p-8">
          <ArticleForm
            action={action}
            defaultValues={{
              title: article.title,
              url: article.url,
              publishedAt: article.publishedAt,
              description: article.description,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
