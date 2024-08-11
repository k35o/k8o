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
    <section className="w-full rounded-xl bg-bgLight shadow-md">
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
  <div className="flex flex-col gap-6 p-4">
    <Heading type="h3">
      {emotion}&nbsp;
      {title}
    </Heading>
    {tags.length > 0 && (
      <div className="hidden justify-end gap-2 md:flex">
        {tags.map((tag) => {
          if (!tag) {
            return null;
          }
          return <TextTag key={tag} color="white" text={tag} />;
        })}
      </div>
    )}
  </div>
);
