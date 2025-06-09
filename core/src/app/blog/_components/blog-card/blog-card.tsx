'use client';

import { useWritingModeValue } from '../toggle-writing-mode';
import { ViewTransition } from '#libs/react';
import { InteractiveCard } from '@/components/card';
import { Heading } from '@/components/heading';
import {
  PublishDateIcon,
  UpdateDateIcon,
  TagIcon,
} from '@/components/icons';
import { TextTag } from '@/components/text-tag';
import { cn } from '@k8o/helpers/cn';
import { formatDate } from '@k8o/helpers/date';
import { Route } from 'next';
import Link from 'next/link';
import { FC } from 'react';

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
}) => {
  const writingMode = useWritingModeValue();
  return (
    <InteractiveCard
      width={writingMode === 'vertical-rl' ? 'fit' : 'full'}
      height={writingMode === 'vertical-rl' ? 'fit' : 'full'}
    >
      <Link
        href={`/blog/${slug}` as Route}
        className={cn(
          'block',
          writingMode === 'vertical-rl'
            ? 'h-5/6 w-full md:h-1/2'
            : 'h-full',
        )}
      >
        <div
          className={cn(
            'flex flex-col justify-between gap-4 p-4',
            writingMode === 'vertical-rl'
              ? 'writing-mode-vertical-rl h-5/6 w-full md:h-1/2'
              : 'writing-mode-horizontal-tb h-full',
          )}
        >
          <div className="flex flex-col gap-1">
            <ViewTransition name={`title-${slug}`}>
              <Heading type="h3" lineClamp={3}>
                {title}
              </Heading>
            </ViewTransition>
            {description && (
              <ViewTransition name={`description-${slug}`}>
                <p
                  className={cn(
                    'text-fg-mute text-sm',
                    writingMode === 'vertical-rl'
                      ? ''
                      : 'line-clamp-3',
                  )}
                >
                  {description}
                </p>
              </ViewTransition>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {tags.length > 0 && (
              <ViewTransition name={`tags-${slug}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <TagIcon size="sm" />
                  {tags.map((tag) => {
                    return <TextTag key={tag} text={tag} size="sm" />;
                  })}
                </div>
              </ViewTransition>
            )}
            <div className="text-fg-mute ml-auto flex items-center gap-4 text-xs">
              <ViewTransition name={`date-${slug}`}>
                <div className="flex items-center gap-1">
                  <PublishDateIcon size="sm" />
                  <span>
                    公開: {formatDate(createdAt, 'yyyy年M月d日')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <UpdateDateIcon size="sm" />
                  <span>
                    更新: {formatDate(updatedAt, 'yyyy年M月d日')}
                  </span>
                </div>
              </ViewTransition>
            </div>
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};
