'use client';

import { Badge, Card, Switch, useToast } from '@k8o/arte-odyssey';
import { useAsyncAction } from '@repo/react-hooks/use-async-action';
import { type FC, useState } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import { setBlogPublished } from '@/features/blog/interface/actions';
import type { BlogRecord } from '@/features/blog/interface/queries';

const BLOG_BASE_URL = 'https://k8o.me/blog';

const BlogRow: FC<{ blog: BlogRecord }> = ({ blog }) => {
  const [published, setPublished] = useState(blog.published);
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const handleToggle = (checked: boolean): void => {
    const next = checked;
    setPublished(next);
    run(() => setBlogPublished(blog.id, next), {
      onError: (message) => {
        setPublished(!next);
        onOpen('error', message);
      },
      onSuccess: () => {
        onOpen('success', next ? '公開しました' : '下書きに戻しました');
      },
    });
  };

  return (
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
        <Switch
          disabled={isPending}
          label={published ? '公開' : '下書き'}
          onChange={handleToggle}
          value={published}
        />
      </div>
    </div>
  );
};

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
