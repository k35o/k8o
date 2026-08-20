import { Badge, Card } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { EmptyState } from '@/app/(authenticated)/_components';
import type { SyncRunRecord } from '@/features/browser-support/interface/queries';

const RESULT_META: Record<
  SyncRunRecord['result'],
  { label: string; tone: 'neutral' | 'success' | 'warning' | 'error' }
> = {
  applied: { label: '反映', tone: 'success' },
  noop: { label: '変化なし', tone: 'neutral' },
  skipped_major: { label: 'メジャー保留', tone: 'warning' },
  fetch_failed: { label: '取得失敗', tone: 'error' },
  validation_failed: { label: '検証失敗', tone: 'error' },
  db_failed: { label: 'DB失敗', tone: 'error' },
};

const TRIGGER_LABELS: Record<SyncRunRecord['trigger'], string> = {
  cron: 'cron',
  manual: '手動',
  monitor: '監視',
};

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

export const SyncRunList: FC<{ runs: SyncRunRecord[] }> = ({ runs }) => {
  if (runs.length === 0) {
    return <EmptyState message="同期はまだ実行されていません" />;
  }

  return (
    <Card variant="shadow">
      {runs.map((run) => {
        const meta = RESULT_META[run.result];
        return (
          <div
            className="border-border-mute flex items-center gap-3 border-b px-5 py-3 text-sm last:border-b-0"
            key={run.id}
          >
            <Badge size="sm" label={meta.label} tone={meta.tone} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs">
                {formatDateTime(run.createdAt)}（{TRIGGER_LABELS[run.trigger]}）
                {run.upstreamVersion !== null && ` v${run.upstreamVersion}`}
              </span>
              {run.detail !== null && (
                <span className="text-fg-mute truncate text-xs">
                  {run.detail}
                </span>
              )}
            </div>
            {run.durationMs !== null && (
              <span className="text-fg-mute shrink-0 text-xs">
                {(run.durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        );
      })}
    </Card>
  );
};
