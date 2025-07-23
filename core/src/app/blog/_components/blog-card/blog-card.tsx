import { ViewTransition } from '#libs/react';
import { InteractiveCard } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import {
  PublishDateIcon,
  UpdateDateIcon,
  TagIcon,
} from '@k8o/arte-odyssey/icons';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import { formatDate } from '@k8o/helpers/date';
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
  return (
    <InteractiveCard>
      <Link href={`/blog/${slug}`} className="block h-full">
        <div className="flex h-full flex-col justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <ViewTransition name={`title-${slug}`}>
              <Heading type="h3" lineClamp={3}>
                {title}
              </Heading>
            </ViewTransition>
            {description && (
              <ViewTransition name={`description-${slug}`}>
                <p className="text-fg-mute line-clamp-3 text-sm">
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
