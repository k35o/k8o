import { LinkButton } from '@k8o/arte-odyssey/link-button';
import { TextTag } from '@k8o/arte-odyssey/text-tag';
import { formatDate } from '@repo/helpers/date/format';
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-border-base border-b">
            <th className="px-4 py-3 font-medium text-fg-mute">タイトル</th>
            <th className="px-4 py-3 font-medium text-fg-mute">タイプ</th>
            <th className="px-4 py-3 font-medium text-fg-mute">サイトURL</th>
            <th className="px-4 py-3 font-medium text-fg-mute">更新日</th>
            <th className="px-4 py-3 font-medium text-fg-mute" />
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr
              className="border-border-base border-b transition-colors hover:bg-bg-mute"
              key={source.id}
            >
              <td className="px-4 py-3 font-medium">{source.title}</td>
              <td className="px-4 py-3">
                <TextTag text={source.type === 'feed' ? 'フィード' : '手動'} />
              </td>
              <td className="max-w-48 truncate px-4 py-3 text-fg-mute">
                {source.siteUrl}
              </td>
              <td className="px-4 py-3 text-fg-mute">
                {formatDate(new Date(source.updatedAt))}
              </td>
              <td className="px-4 py-3">
                <LinkButton
                  color="gray"
                  href={`/reading-list/sources/${String(source.id)}`}
                  size="sm"
                  variant="skeleton"
                >
                  編集
                </LinkButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
