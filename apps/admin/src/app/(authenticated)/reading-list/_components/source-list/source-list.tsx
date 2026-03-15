import { formatDate } from '@repo/helpers/date/format';
import Link from 'next/link';
import type { FC } from 'react';

type Source = {
  id: number;
  title: string;
  url: string;
  siteUrl: string;
  type: 'feed' | 'manual';
  createdAt: string;
  updatedAt: string;
};

export const SourceList: FC<{ sources: Source[] }> = ({ sources }) => {
  if (sources.length === 0) {
    return (
      <p className="py-12 text-center text-fg-mute text-sm">
        ソースがまだ登録されていません
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {sources.map((source) => (
        <Link
          className="flex items-center gap-3 border-border-base border-b px-4 py-3 text-sm transition-colors hover:bg-bg-mute"
          href={`/reading-list/sources/${String(source.id)}`}
          key={source.id}
        >
          <span className="min-w-0 flex-1 truncate font-medium">
            {source.title}
          </span>
          <span className="shrink-0 text-fg-mute text-xs">
            {source.type === 'feed' ? 'フィード' : '手動'}
          </span>
          <span className="hidden w-48 truncate text-fg-mute sm:block">
            {source.siteUrl}
          </span>
          <span className="w-40 shrink-0 text-right text-fg-mute">
            {formatDate(new Date(source.updatedAt))}
          </span>
        </Link>
      ))}
    </div>
  );
};
