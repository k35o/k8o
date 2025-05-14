import { ViewTransition } from '#libs/react';
import { getBlog } from '#services/blog';
import { TagIcon } from '@/components/icons';
import { TextTag } from '@/components/text-tag';
import { Route } from 'next';
import { FC } from 'react';

export const Tags: FC<{ slug: string }> = async ({ slug }) => {
  const tags = (await getBlog(slug)).tags;

  return (
    <ViewTransition name={`tags-${slug}`}>
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <TagIcon size="sm" />
          {tags.map((tag) => {
            return (
              <TextTag
                key={tag.id}
                text={tag.name}
                href={`/tags/${tag.id.toString()}` as Route}
              />
            );
          })}
        </div>
      )}
    </ViewTransition>
  );
};
