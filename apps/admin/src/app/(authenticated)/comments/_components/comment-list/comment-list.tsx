import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import type { CommentItem } from '@/features/comments/interface/queries';

const BLOG_BASE_URL = 'https://k8o.me/blog';

export const CommentList: FC<{ items: CommentItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return (
      <p className="text-fg-mute py-12 text-center text-sm">
        まだお問い合わせはありません。
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {items.map((item) => (
        <li
          className="border-border-base bg-bg-base flex flex-col gap-3 rounded-xl border p-5"
          key={item.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item.feedbackName !== null && (
                <span className="bg-bg-mute text-fg-base rounded-full px-2 py-0.5 font-medium">
                  {item.feedbackName}
                </span>
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
                <span className="text-fg-subtle text-xs">未紐づけ</span>
              )}
            </div>
            <div className="text-fg-subtle flex items-center gap-3 text-xs">
              <time dateTime={item.createdAt}>
                {formatDate(new Date(item.createdAt), 'yyyy年M月d日 HH:mm')}
              </time>
              <span>
                {item.sentAt === null ? (
                  <span className="text-fg-warning">未通知</span>
                ) : (
                  '通知済み'
                )}
              </span>
            </div>
          </div>
          {item.message !== null && item.message !== '' ? (
            <p className="text-fg-base text-sm leading-relaxed whitespace-pre-wrap">
              {item.message}
            </p>
          ) : (
            <p className="text-fg-subtle text-sm italic">本文なし</p>
          )}
        </li>
      ))}
    </ol>
  );
};
