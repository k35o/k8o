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
      <p className="text-fg-mute py-12 text-center text-sm">
        ソースがまだ登録されていません
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {sources.map((source) => (
        <Link
          className="border-border-base hover:bg-bg-mute flex items-center gap-3 border-b px-4 py-3 text-sm transition-colors"
          href={`/reading-list/sources/${String(source.id)}`}
          key={source.id}
        >
          <span className="min-w-0 flex-1 truncate font-medium">
            {source.title}
          </span>
          <span className="text-fg-mute shrink-0 text-xs">
            {source.type === 'feed' ? 'フィード' : '手動'}
          </span>
          <span className="text-fg-mute hidden w-48 truncate sm:block">
            {source.siteUrl}
          </span>
          <span className="text-fg-mute hidden w-40 shrink-0 text-right sm:block">
            {formatDate(new Date(source.updatedAt))}
          </span>
        </Link>
      ))}
    </div>
  );
};
