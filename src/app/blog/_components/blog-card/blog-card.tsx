import { Heading } from '@/components/heading';
import { TextTag } from '@/components/text-tag';
import { isInternalRoute } from '@/utils/is-internal-route';
import Link from 'next/link';
import { FC } from 'react';

type BlogCardProps = {
  link: string;
  emotion: string;
  title: string;
  tags: [string?, string?, string?, string?, string?];
};

export const BlogCard: FC<BlogCardProps> = ({
  link,
  emotion,
  title,
  tags,
}) => {
  return (
    <section className="h-40 rounded-xl bg-bgBase shadow-md">
      {isInternalRoute(link) ? (
        <Link href={link}>
          <BlogCardContent
            emotion={emotion}
            title={title}
            tags={tags}
          />
        </Link>
      ) : (
        <a href={link} target="_blank" rel="noopener noreferrer">
          <BlogCardContent
            emotion={emotion}
            title={title}
            tags={tags}
          />
        </a>
      )}
    </section>
  );
};

export const BlogCardContent: FC<Omit<BlogCardProps, 'link'>> = ({
  emotion,
  title,
  tags,
}) => (
  <div className="flex gap-6 p-4">
    <div className="flex size-32 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-7xl">
      {emotion}
    </div>
    <div className="flex w-full flex-col justify-around">
      <Heading type="h3" lineClamp={3}>
        {title}
      </Heading>
      {tags.length > 0 && (
        <div className="hidden justify-end gap-2 md:flex">
          {tags.map((tag) => {
            if (!tag) {
              return null;
            }
            return <TextTag key={tag} text={tag} />;
          })}
        </div>
      )}
    </div>
  </div>
);
