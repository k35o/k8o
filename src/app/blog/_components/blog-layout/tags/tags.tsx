import { getBlog } from '#services/blog';
import { TextTag } from '@/components/text-tag';
import { FC } from 'react';

export const Tags: FC<{ slug: string }> = async ({ slug }) => {
  const tags = (await getBlog(slug)).tags;

  return (
    <>
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.slice(0, 5).map((tag) => {
            return <TextTag key={tag} text={tag} />;
          })}
        </div>
      )}
    </>
  );
};
