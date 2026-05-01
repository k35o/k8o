import {
  Badge,
  Heading,
  InteractiveCard,
  PublishDateIcon,
  TagIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

type BlogCardProps = {
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: Date;
};

export const BlogCard: FC<BlogCardProps> = ({
  slug,
  title,
  description,
  tags,
  createdAt,
}) => (
  <InteractiveCard>
    <Link className="group block h-full" href={`/blog/${slug}` as Route}>
      <div className="flex h-full flex-col justify-between gap-4 p-4">
        <div className="group-hover:text-primary-fg flex flex-col gap-1">
          <Heading lineClamp={2} type="h3">
            {title}
          </Heading>
          {description && (
            <p className="text-fg-mute line-clamp-2 text-sm">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <TagIcon size="sm" />
              {tags.map((tag) => (
                <Badge key={tag} size="sm" text={tag} />
              ))}
            </div>
          )}
          <div className="text-fg-mute ml-auto flex items-center gap-1 text-xs">
            <PublishDateIcon size="sm" />
            <span>{formatDate(createdAt, 'yyyy年M月d日')}</span>
          </div>
        </div>
      </div>
    </Link>
  </InteractiveCard>
);
