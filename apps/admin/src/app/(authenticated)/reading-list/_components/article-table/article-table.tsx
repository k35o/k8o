import { Card } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import type { FC } from 'react';

import { ButtonLink, EmptyState } from '@/app/(authenticated)/_components';

import { ArticleRowActions } from '../article-row-actions';

type Article = {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
};

export const ArticleTable: FC<{ articles: Article[] }> = ({ articles }) => {
  if (articles.length === 0) {
    return <EmptyState message="取得済みの記事はありません" />;
  }

  return (
    <Card variant="shadow">
      {articles.map((article) => (
        <div
          className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0"
          key={article.id}
        >
          <a
            className="min-w-0 flex-1 truncate font-medium hover:underline"
            href={article.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {article.title}
          </a>
          <span className="text-fg-mute hidden shrink-0 text-xs sm:block">
            {article.sourceName}
          </span>
          <span className="text-fg-mute hidden w-28 shrink-0 text-right text-xs sm:block">
            {formatDate(new Date(article.publishedAt))}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <ButtonLink
              color="base"
              href={`/reading-list/articles/${String(article.id)}` as Route}
              size="sm"
              variant="skeleton"
            >
              編集
            </ButtonLink>
            <ArticleRowActions id={article.id} title={article.title} />
          </div>
        </div>
      ))}
    </Card>
  );
};
