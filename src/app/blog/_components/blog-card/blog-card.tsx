import { ViewTransition } from '#libs/react';
import { getBlogMetadata } from '#services/blog';
import { InteractiveCard } from '@/components/card';
import { Heading } from '@/components/heading';
import {
  PublishDateIcon,
  UpdateDateIcon,
  TagIcon,
} from '@/components/icons';
import { TextTag } from '@/components/text-tag';
import { formatDate } from '@/utils/date/format';
import { Route } from 'next';
import Link from 'next/link';
import { FC } from 'react';

type BlogCardProps = {
  slug: string;
  tags: string[];
};

export const BlogCard: FC<BlogCardProps> = async ({ slug, tags }) => {
  const metadata = await getBlogMetadata(slug);
  return (
    <ViewTransition name={`all-${slug}`}>
      <InteractiveCard>
        <Link
          href={`/blog/${slug}` as Route}
          className="block h-full"
        >
          <div className="flex h-full flex-col justify-between gap-4 p-4">
            <div className="flex flex-col gap-1">
              <ViewTransition name={`title-${slug}`}>
                <Heading type="h3" lineClamp={3}>
                  {metadata.title}
                </Heading>
              </ViewTransition>
              {metadata.description && (
                <ViewTransition name={`description-${slug}`}>
                  <p className="text-fg-mute line-clamp-3 text-sm">
                    {metadata.description}
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
                      return (
                        <TextTag key={tag} text={tag} size="sm" />
                      );
                    })}
                  </div>
                </ViewTransition>
              )}
              <div className="text-fg-mute ml-auto flex items-center gap-4 text-xs">
                <ViewTransition name={`date-${slug}`}>
                  <div className="flex items-center gap-1">
                    <PublishDateIcon size="sm" />
                    <span>
                      公開:{' '}
                      {formatDate(metadata.createdAt, 'yyyy年M月d日')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UpdateDateIcon size="sm" />
                    <span>
                      更新:{' '}
                      {formatDate(metadata.updatedAt, 'yyyy年M月d日')}
                    </span>
                  </div>
                </ViewTransition>
              </div>
            </div>
          </div>
        </Link>
      </InteractiveCard>
    </ViewTransition>
  );
};
