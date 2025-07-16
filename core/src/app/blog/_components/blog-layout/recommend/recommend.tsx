import { getBlogsByTags } from '#api/blog';
import { InteractiveCard } from '@/components/card';
import { Heading } from '@/components/heading';
import { PublishDateIcon, TagIcon } from '@/components/icons';
import { TextTag } from '@/components/text-tag';
import { formatDate } from '@k8o/helpers/date';
import Link from 'next/link';
import { FC } from 'react';

export const Recommend: FC<{ slug: string }> = async ({ slug }) => {
  const blogs = await getBlogsByTags(slug);
  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Heading type="h3">関連記事</Heading>
      <div className="grid-cols-auto-fit-80 grid gap-4">
        {blogs.map((blog) => (
          <InteractiveCard key={blog.id}>
            <Link href={`/blog/${blog.slug}`}>
              <div className="flex flex-col gap-4 p-4">
                <Heading type="h4">{blog.title}</Heading>
                <div className="flex flex-col flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <TagIcon size="sm" />
                    {blog.tags.map((tag) => {
                      return (
                        <TextTag key={tag} text={tag} size="sm" />
                      );
                    })}
                  </div>
                  <div className="text-fg-mute ml-auto flex items-center gap-1 text-xs">
                    <PublishDateIcon size="sm" />
                    <span>
                      公開:{' '}
                      {formatDate(blog.createdAt, 'yyyy年M月d日')}
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
