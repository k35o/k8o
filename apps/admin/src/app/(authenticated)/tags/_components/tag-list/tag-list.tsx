import { Badge, Card } from '@k8ordo/ui';
import type { FC } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import type { TagWithUsage } from '@/features/tags/interface/queries';

import { TagRowActions } from '../tag-row-actions';

const TagRow: FC<{ tag: TagWithUsage }> = ({ tag }) => (
  <div className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0">
    <span className="min-w-0 flex-1 truncate font-medium">{tag.name}</span>
    <span className="text-fg-mute hidden shrink-0 text-xs sm:block">
      ブログ {tag.blogCount}・トーク {tag.talkCount}・スライド {tag.slideCount}
    </span>
    <Badge
      size="sm"
      label={`計 ${String(tag.total)}`}
      tone={tag.total > 0 ? 'neutral' : 'warning'}
    />
    <TagRowActions canDelete={tag.total === 0} id={tag.id} name={tag.name} />
  </div>
);

export const TagList: FC<{ tags: TagWithUsage[] }> = ({ tags }) => {
  if (tags.length === 0) {
    return <EmptyState message="タグがありません" />;
  }

  return (
    <Card variant="shadow">
      {tags.map((tag) => (
        <TagRow key={tag.id} tag={tag} />
      ))}
    </Card>
  );
};
