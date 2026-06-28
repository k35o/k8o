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

type ContentCardProps = {
  hrefPrefix: string;
  headingType: 'h3' | 'h4';
  slug: string;
  tags: string[];
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  readingTime?: number;
};

// blog / slides の一覧カード共通の表示。差分は href プレフィックスと Heading の見出しレベル。
export const ContentCard: FC<ContentCardProps> = ({
  hrefPrefix,
  headingType,
  slug,
  tags,
  title,
  description,
  createdAt,
  updatedAt,
  readingTime,
}) => (
  <Card interactive>
    <Link
      className="group block h-full"
      href={`${hrefPrefix}/${slug}` as Route}
    >
      <div className="flex h-full flex-col justify-between gap-4 p-4">
        <div className="group-hover:text-primary-fg flex flex-col gap-1">
          <Heading lineClamp={3} type={headingType}>
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
          <div className="text-fg-mute ml-auto flex flex-col items-end gap-1 text-xs">
            {readingTime !== undefined && (
              <span>約{readingTime}分で読めます</span>
            )}
            <div className="flex items-center gap-4">
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
      </div>
    </Link>
  </Card>
);
