import { ExternalLinkIcon, Card, PublishDateIcon } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { ReadingCardBody } from './body';
import { ReadingCardImage } from './image';

// 多層防御: DB に不正なスキームの URL が混入しても javascript: 等をリンク化しない
const isHttpUrl = (value: string): boolean => {
  if (!URL.canParse(value)) {
    return false;
  }
  const { protocol } = new URL(value);
  return protocol === 'https:' || protocol === 'http:';
};

export type ReadingCardProps = {
  articleId: number;
  url: string;
  title: string;
  publishedAt: string;
  imageUrl: string | null;
  description: string | null;
  summary: string | null;
  summaryGaveUp: boolean;
  sourceTitle: string;
};

export const ReadingCard: FC<ReadingCardProps> = ({
  articleId,
  url,
  title,
  publishedAt,
  imageUrl,
  description,
  summary,
  summaryGaveUp,
  sourceTitle,
}) => (
  <div className="vertical:max-w-container-md">
    <Card interactive appearance="shadow">
      <div className="group vertical:flex-row relative isolate flex h-full flex-col overflow-hidden sm:flex-row">
        {imageUrl !== null && <ReadingCardImage src={imageUrl} />}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="group-hover:text-primary-fg flex flex-col gap-1 transition-colors duration-200 ease-out">
            <p className="text-md vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2 font-bold">
              {/* タイトルをリンク化し ::after でカード全体を当たり判定にする
                  （空 anchor + aria-label によるタイトルの二重読みを回避） */}
              {isHttpUrl(url) ? (
                <a
                  className="after:absolute after:inset-0"
                  href={url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </p>
            <ReadingCardBody
              articleId={articleId}
              description={description}
              summary={summary}
              summaryGaveUp={summaryGaveUp}
            />
          </div>
          <div className="text-fg-subtle mt-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1">
              <PublishDateIcon size="sm" />
              <span>{formatDate(new Date(publishedAt), 'yyyy年M月d日')}</span>
            </div>
            <div className="flex items-center gap-1">
              <ExternalLinkIcon size="sm" />
              <p>{sourceTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);
