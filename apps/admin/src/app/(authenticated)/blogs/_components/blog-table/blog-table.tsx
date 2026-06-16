'use client';

import { Badge, Card } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { EmptyState, PublishToggle } from '@/app/(authenticated)/_components';
import { setBlogPublished } from '@/features/blog/interface/actions';
import type { BlogRecord } from '@/features/blog/interface/queries';

const BLOG_BASE_URL = 'https://k8o.me/blog';

const BlogRow: FC<{ blog: BlogRecord }> = ({ blog }) => (
  <div className="border-border-mute flex items-center gap-3 border-b px-5 py-4 text-sm last:border-b-0">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <a
        className="truncate font-medium hover:underline"
        href={`${BLOG_BASE_URL}/${blog.slug}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {blog.slug}
      </a>
      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {blog.tags.map((tag) => (
            <Badge key={tag} size="sm" text={tag} tone="neutral" />
          ))}
        </div>
      )}
    </div>
    <span className="text-fg-mute hidden w-20 shrink-0 text-right tabular-nums sm:block">
      {blog.views.toLocaleString()}
    </span>
    <span className="text-fg-mute hidden w-16 shrink-0 text-right tabular-nums sm:block">
      {blog.commentCount}
    </span>
    <div className="flex w-24 shrink-0 justify-end">
      <PublishToggle
        initialPublished={blog.published}
        onToggle={(next) => setBlogPublished(blog.id, next)}
      />
    </div>
  </div>
);

export const BlogTable: FC<{ blogs: BlogRecord[] }> = ({ blogs }) => {
  if (blogs.length === 0) {
    return <EmptyState message="条件に一致する記事はありません" />;
  }

  return (
    <Card appearance="shadow">
      <div className="text-fg-mute border-border-mute flex items-center gap-3 border-b px-5 py-3 text-xs">
        <span className="flex-1">記事 (slug)</span>
        <span className="hidden w-20 text-right sm:block">閲覧数</span>
        <span className="hidden w-16 text-right sm:block">コメント</span>
        <span className="w-24 text-right">公開状態</span>
      </div>
      {blogs.map((blog) => (
        <BlogRow blog={blog} key={blog.id} />
      ))}
    </Card>
  );
};
