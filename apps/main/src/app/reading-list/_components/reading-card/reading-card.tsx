import {
  ExternalLinkIcon,
  InteractiveCard,
  PublishDateIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { ReadingCardBody } from './body';
import { ReadingCardImage } from './image';

export type ReadingCardProps = {
  articleId: number;
  url: string;
  title: string;
  publishedAt: string;
  imageUrl: string | null;
  description: string | null;
  summary: string | null;
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
  sourceTitle,
}) => (
  <div className="vertical:max-w-container-md">
    <InteractiveCard appearance="shadow">
      <div className="group vertical:flex-row relative isolate flex h-full flex-col overflow-hidden sm:flex-row">
        {/* カード全体を覆うリンク。要約ボタンは前面(z-10)に出して独立操作できるようにする */}
        <a
          aria-label={title}
          className="absolute inset-0"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        />
        {imageUrl !== null && <ReadingCardImage src={imageUrl} />}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="group-hover:text-primary-fg flex flex-col gap-1 transition-colors duration-200 ease-out">
            <p className="text-md vertical:block vertical:max-block-[8em] vertical:overflow-hidden line-clamp-2 font-bold">
              {title}
            </p>
            <ReadingCardBody
              articleId={articleId}
              description={description}
              initialSummary={summary}
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
    </InteractiveCard>
  </div>
);
