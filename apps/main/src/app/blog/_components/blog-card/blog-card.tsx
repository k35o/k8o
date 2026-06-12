import {
  Badge,
  Heading,
  Card,
  PublishDateIcon,
  TagIcon,
  UpdateDateIcon,
} from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

type BlogCardProps = {
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export const BlogCard: FC<BlogCardProps> = ({
  slug,
  tags,
  title,
  description,
  createdAt,
  updatedAt,
}) => (
  <Card interactive>
    <Link className="group block h-full" href={`/blog/${slug}` as Route}>
      <div className="flex h-full flex-col justify-between gap-4 p-4">
        <div className="group-hover:text-primary-fg flex flex-col gap-1">
          <Heading lineClamp={3} type="h4">
            {title}
          </Heading>
          {description !== null && (
            <p className="text-fg-mute line-clamp-3 text-sm">{description}</p>
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
          <div className="text-fg-mute ml-auto flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <PublishDateIcon size="sm" />
              <span>
                公開: {formatDate(new Date(createdAt), 'yyyy年M月d日')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <UpdateDateIcon size="sm" />
              <span>
                更新: {formatDate(new Date(updatedAt), 'yyyy年M月d日')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </Card>
);
