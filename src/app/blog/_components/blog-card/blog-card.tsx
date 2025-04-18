import { getBlogMetadata } from '#services/blog';
import { InteractiveCard } from '@/components/card';
import { Heading } from '@/components/heading';
import { PublishDateIcon, UpdateDateIcon } from '@/components/icons';
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
    <InteractiveCard>
      <Link href={`/blog/${slug}` as Route} className="block h-full">
        <div className="flex h-full flex-col justify-between gap-4 p-4">
          <div className="flex flex-col gap-1">
            <Heading type="h3" lineClamp={3}>
              {metadata.title}
            </Heading>
            {metadata.description && (
              <p className="text-fg-mute line-clamp-3 text-sm">
                {metadata.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  return <TextTag key={tag} text={tag} size="sm" />;
                })}
              </div>
            )}
            <div className="text-fg-mute ml-auto flex items-center gap-4 text-xs">
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
            </div>
          </div>
        </div>
      </Link>
    </InteractiveCard>
  );
};
