import { InteractiveCard } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import { PublishDateIcon, TagIcon } from '@k8o/arte-odyssey/icons';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
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
}) => {
  return (
    <InteractiveCard>
      <Link className="group block h-full" href={`/blog/${slug}` as Route}>
        <div className="flex h-full flex-col justify-between gap-4 p-4">
          <div className="flex flex-col gap-1 group-hover:text-primary-fg">
            <Heading lineClamp={2} type="h3">
              {title}
            </Heading>
            {description && (
              <p className="line-clamp-2 text-fg-mute text-sm">{description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <TagIcon size="sm" />
                {tags.map((tag) => (
                  <TextTag key={tag} size="sm" text={tag} />
                ))}
              </div>
            )}
            <div className="ml-auto flex items-center gap-1 text-fg-mute text-xs">
              <PublishDateIcon size="sm" />
              <span>{formatDate(createdAt, 'yyyy年M月d日')}</span>
            </div>
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};
