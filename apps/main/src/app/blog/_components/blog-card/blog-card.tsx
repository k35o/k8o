import {
  Badge,
  Heading,
  InteractiveCard,
  PublishDateIcon,
  TagIcon,
  UpdateDateIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';
import { ViewTransition } from 'react';

type BlogCardProps = {
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const BlogCard: FC<BlogCardProps> = ({
  slug,
  tags,
  title,
  description,
  createdAt,
  updatedAt,
}) => (
  <InteractiveCard>
    <Link className="group block h-full" href={`/blog/${slug}` as Route}>
      <div className="flex h-full flex-col justify-between gap-4 p-4">
        <div className="group-hover:text-primary-fg flex flex-col gap-1">
          <ViewTransition name={`title-${slug}`}>
            <Heading lineClamp={3} type="h3">
              {title}
            </Heading>
          </ViewTransition>
          {description && (
            <ViewTransition name={`description-${slug}`}>
              <p className="text-fg-mute line-clamp-3 text-sm">{description}</p>
            </ViewTransition>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {tags.length > 0 && (
            <ViewTransition name={`tags-${slug}`}>
              <div className="flex flex-wrap items-center gap-2">
                <TagIcon size="sm" />
                {tags.map((tag) => (
                  <Badge key={tag} size="sm" text={tag} />
                ))}
              </div>
            </ViewTransition>
          )}
          <div className="text-fg-mute ml-auto flex items-center gap-4 text-xs">
            <ViewTransition name={`date-${slug}`}>
              <div className="flex items-center gap-1">
                <PublishDateIcon size="sm" />
                <span>公開: {formatDate(createdAt, 'yyyy年M月d日')}</span>
              </div>
              <div className="flex items-center gap-1">
                <UpdateDateIcon size="sm" />
                <span>更新: {formatDate(updatedAt, 'yyyy年M月d日')}</span>
              </div>
            </ViewTransition>
          </div>
        </div>
      </div>
    </Link>
  </InteractiveCard>
);
