import { Badge, Heading, Card, PublishDateIcon, TagIcon } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import { getBlogsByTags } from '@/features/blog/interface/queries';

type RecommendProps = {
  blogs: Awaited<ReturnType<typeof getBlogsByTags>>;
};

export const RecommendContent: FC<RecommendProps> = ({ blogs }) => {
  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <Heading level="h3">関連記事</Heading>
      <div className="grid-cols-auto-fit-80 grid gap-4">
        {blogs.map((blog) => (
          <Card interactive key={blog.id}>
            <Link href={`/blog/${blog.slug}` as Route}>
              <div className="flex flex-col gap-4 p-4">
                <Heading level="h4">{blog.title}</Heading>
                <div className="flex flex-col flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <TagIcon size="sm" />
                    {blog.tags.map((tag) => (
                      <Badge key={tag} size="sm" label={tag} />
                    ))}
                  </div>
                  <div className="text-fg-mute ml-auto flex items-center gap-1 text-xs">
                    <PublishDateIcon size="sm" />
                    <span>
                      公開:{' '}
                      {formatDate(new Date(blog.createdAt), 'yyyy年M月d日')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const Recommend: FC<{ slug: string }> = async ({ slug }) => {
  const blogs = await getBlogsByTags(slug);
  return <RecommendContent blogs={blogs} />;
};
