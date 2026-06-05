import { Card } from '@k8o/arte-odyssey';
import { notFound } from 'next/navigation';

import { updateArticle } from '@/features/reading-list/interface/article-actions';
import { getArticleForEdit } from '@/features/reading-list/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { ArticleForm } from '../article-form/article-form';

export const EditArticleContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  await verifySession();
  const { id } = await params;
  const article = await getArticleForEdit(id);

  if (!article) {
    notFound();
  }

  const action = updateArticle.bind(null, article.id);

  return (
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
  );
};
