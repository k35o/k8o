import { Card } from '@k8o/arte-odyssey';

import { createArticle } from '@/features/reading-list/interface/article-actions';
import { getReadingListContentData } from '@/features/reading-list/interface/queries';
import { verifySession } from '@/shared/auth/verify-session';

import { ArticleForm } from '../article-form/article-form';

export const NewArticleContent = async () => {
  await verifySession();
  const { sources } = await getReadingListContentData();

  return (
    <Card appearance="shadow">
      <div className="p-8">
        <ArticleForm
          action={createArticle}
          sources={sources.map((s) => ({ id: s.id, title: s.title }))}
        />
      </div>
    </Card>
  );
};
