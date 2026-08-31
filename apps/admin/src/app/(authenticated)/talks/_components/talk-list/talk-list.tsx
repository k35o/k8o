import { Badge, Card } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import type { FC } from 'react';

import { ButtonLink, EmptyState } from '@/app/(authenticated)/_components';
import type { TalkRecord } from '@/features/talks/interface/queries';

import { TalkRowActions } from '../talk-row-actions';

const TalkRow: FC<{ talk: TalkRecord }> = ({ talk }) => (
  <div className="border-border-mute flex flex-col gap-2 border-b px-5 py-4 text-sm last:border-b-0">
    <div className="flex items-start justify-between gap-3">
      <a
        className="min-w-0 font-medium hover:underline"
        href={talk.eventUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {talk.title}
      </a>
      <div className="flex shrink-0 items-center gap-1">
        <ButtonLink
          color="base"
          href={`/talks/${String(talk.id)}` as Route}
          size="sm"
          variant="skeleton"
        >
          編集
        </ButtonLink>
        <TalkRowActions id={talk.id} title={talk.title} />
      </div>
    </div>

    <div className="text-fg-mute flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span>{talk.eventName}</span>
      {talk.eventLocation !== null && <span>・ {talk.eventLocation}</span>}
      <span>・ {formatDate(new Date(talk.eventDate))}</span>
    </div>

    {talk.tags.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {talk.tags.map((tag) => (
          <Badge key={tag} size="sm" label={tag} tone="neutral" />
        ))}
      </div>
    )}
  </div>
);

export const TalkList: FC<{ talks: TalkRecord[] }> = ({ talks }) => {
  if (talks.length === 0) {
    return <EmptyState message="トークがありません" />;
  }

  return (
    <Card variant="shadow">
      {talks.map((talk) => (
        <TalkRow key={talk.id} talk={talk} />
      ))}
    </Card>
  );
};
