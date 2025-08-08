import { InteractiveCard } from '@k8o/arte-odyssey/card';
import { Heading } from '@k8o/arte-odyssey/heading';
import { PublishDateIcon, TagIcon } from '@k8o/arte-odyssey/icons';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import { formatDate } from '@k8o/helpers/date';
import Link from 'next/link';
import type { FC } from 'react';
import { getBlogsByTags } from '#api/blog';

export const Recommend: FC<{ slug: string }> = async ({ slug }) => {
  const blogs = await getBlogsByTags(slug);
  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Heading type="h3">関連記事</Heading>
      <div className="grid grid-cols-auto-fit-80 gap-4">
        {blogs.map((blog) => (
          <InteractiveCard key={blog.id}>
            <Link href={`/blog/${blog.slug}`}>
              <div className="flex flex-col gap-4 p-4">
                <Heading type="h4">{blog.title}</Heading>
                <div className="flex flex-col flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <TagIcon size="sm" />
                    {blog.tags.map((tag) => {
                      return <TextTag key={tag} size="sm" text={tag} />;
                    })}
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-fg-mute text-xs">
                    <PublishDateIcon size="sm" />
                    <span>
                      公開: {formatDate(blog.createdAt, 'yyyy年M月d日')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </InteractiveCard>
        ))}
      </div>
    </div>
  );
};
