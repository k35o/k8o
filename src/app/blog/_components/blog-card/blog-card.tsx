import { InteractiveCard } from '@/components/card';
import { Heading } from '@/components/heading';
import { PublishDateIcon, UpdateDateIcon } from '@/components/icons';
import { TextTag } from '@/components/text-tag';
import { formatDate } from '@/utils/date/format';
import { isInternalRoute } from '@/utils/is-internal-route';
import Link from 'next/link';
import { FC } from 'react';

type BlogCardProps = {
  link: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
};

export const BlogCard: FC<BlogCardProps> = ({ link, ...rest }) => {
  return (
    <InteractiveCard>
      {isInternalRoute(link) ? (
        <Link href={link} className="block h-full">
          <BlogCardContent {...rest} />
        </Link>
      ) : (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
        >
          <BlogCardContent {...rest} />
        </a>
      )}
    </InteractiveCard>
  );
};

export const BlogCardContent: FC<Omit<BlogCardProps, 'link'>> = ({
  title,
  description,
  createdAt,
  updatedAt,
  tags,
}) => (
  <div className="flex h-full flex-col justify-between gap-4 p-4">
    <div className="flex flex-col gap-1">
      <Heading type="h3" lineClamp={3}>
        {title}
      </Heading>
      {description && (
        <p className="text-fg-mute line-clamp-3 text-sm">
          {description}
        </p>
      )}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2">
      {tags.length > 0 && (
        <div className="hidden gap-2 md:flex">
          {tags.slice(0, 5).map((tag) => {
            return <TextTag key={tag} text={tag} />;
          })}
        </div>
      )}
      <div className="text-fg-mute ml-auto flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <PublishDateIcon size="sm" />
          <span>公開: {formatDate(createdAt, 'yyyy年M月d日')}</span>
        </div>
        <div className="flex items-center gap-1">
          <UpdateDateIcon size="sm" />
          <span>更新: {formatDate(updatedAt, 'yyyy年M月d日')}</span>
        </div>
      </div>
    </div>
  </div>
);
