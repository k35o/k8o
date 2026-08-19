import { Badge, Heading } from '@k8o/arte-odyssey';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import type { BrowserSupportFeatureChange } from '@/features/browser-support/interface/queries';

const STATUS_LABEL: Record<BrowserSupportFeatureChange['status'], string> = {
  newly: 'Newly',
  widely: 'Widely',
};

const STATUS_TONE: Record<
  BrowserSupportFeatureChange['status'],
  'info' | 'success'
> = {
  newly: 'info',
  widely: 'success',
};

type ChangeGroup = {
  upstreamVersion: string;
  changedAt: string;
  changes: BrowserSupportFeatureChange[];
};

// changedAt 降順で渡される前提で、同期バッチ単位に連続グループ化する。強制再同期では
// 同一バージョンが別時刻のバッチとして再記録されうるため、バージョンだけでなく
// changedAt(バッチ内で同一の時刻)も一致条件に含める。
const groupBySyncBatch = (
  changes: BrowserSupportFeatureChange[],
): ChangeGroup[] => {
  const groups: ChangeGroup[] = [];
  for (const change of changes) {
    const last = groups.at(-1);
    if (
      last !== undefined &&
      last.upstreamVersion === change.upstreamVersion &&
      last.changedAt === change.changedAt
    ) {
      last.changes.push(change);
    } else {
      groups.push({
        upstreamVersion: change.upstreamVersion,
        changedAt: change.changedAt,
        changes: [change],
      });
    }
  }
  return groups;
};

export const BrowserSupportRecentChanges: FC<{
  changes: BrowserSupportFeatureChange[];
}> = ({ changes }) => {
  if (changes.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-3">
      <Heading type="h3">最近の更新</Heading>
      <div className="flex flex-col gap-4">
        {groupBySyncBatch(changes).map((group) => (
          <div
            className="flex flex-col gap-1.5"
            key={`${group.upstreamVersion}-${group.changedAt}`}
          >
            <p className="text-fg-mute text-xs">
              {formatDate(new Date(group.changedAt))}・v{group.upstreamVersion}
            </p>
            <ul className="flex flex-col gap-1.5">
              {group.changes.map((change) => (
                <li
                  className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
                  key={`${change.featureId}-${change.changedAt}`}
                >
                  <Badge
                    size="sm"
                    text={STATUS_LABEL[change.status]}
                    tone={STATUS_TONE[change.status]}
                  />
                  <span className="text-sm">{change.featureName}</span>
                  <span className="text-fg-mute text-xs">
                    {change.previousStatus === null
                      ? 'Baseline 到達'
                      : `${STATUS_LABEL[change.previousStatus]} から`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
