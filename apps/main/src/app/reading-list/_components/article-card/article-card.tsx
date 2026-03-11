import { Card } from '@k8o/arte-odyssey/card';
import { ExternalLinkIcon, PublishDateIcon } from '@k8o/arte-odyssey/icons';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

export const ArticleCard: FC<{
  title: string;
  url: string;
  publishedAt: string;
  source: {
    title: string;
    siteUrl: string;
  };
}> = ({ title, url, publishedAt, source }) => {
  return (
    <Card>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex flex-col gap-1">
          <a
            className="flex items-center gap-2 font-bold text-md hover:underline md:text-lg"
            href={url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {title}
            <ExternalLinkIcon size="sm" />
          </a>
          <a
            className="text-fg-mute text-sm hover:underline"
            href={source.siteUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {source.title}
          </a>
        </div>
        <div className="flex items-center gap-1 text-fg-mute text-sm">
          <PublishDateIcon size="sm" />
          <span>{formatDate(new Date(publishedAt))}</span>
        </div>
      </div>
    </Card>
  );
};
