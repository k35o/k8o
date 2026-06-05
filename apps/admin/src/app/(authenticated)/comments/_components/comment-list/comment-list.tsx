import { Badge } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import type { CommentItem } from '@/features/comments/interface/queries';

import { CommentActions } from '../comment-actions';

const BLOG_BASE_URL = 'https://k8o.me/blog';

export const CommentList: FC<{ items: CommentItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return <EmptyState message="条件に一致するお問い合わせはありません" />;
  }

  return (
    <ol className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          className="border-border-mute bg-bg-base flex flex-col gap-3 rounded-2xl border p-5 shadow-sm"
          key={item.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item.feedbackName !== null && (
                <Badge size="sm" text={item.feedbackName} tone="neutral" />
              )}
              {item.blogSlug !== null && (
                <a
                  className="text-fg-mute hover:text-fg-base inline-flex items-center gap-1 underline transition-colors"
                  href={`${BLOG_BASE_URL}/${item.blogSlug}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  /blog/{item.blogSlug}
                </a>
              )}
              {item.blogSlug === null && (
                <span className="text-fg-mute text-xs">未紐づけ</span>
              )}
            </div>
            <time className="text-fg-mute text-xs" dateTime={item.createdAt}>
              {formatDate(new Date(item.createdAt), 'yyyy年M月d日 HH:mm')}
            </time>
          </div>

          {item.message !== null && item.message !== '' ? (
            <p className="text-fg-base text-sm leading-relaxed whitespace-pre-wrap">
              {item.message}
            </p>
          ) : (
            <p className="text-fg-mute text-sm italic">本文なし</p>
          )}

          <div className="border-border-mute flex justify-end border-t pt-3">
            <CommentActions id={item.id} />
          </div>
        </li>
      ))}
    </ol>
  );
};
