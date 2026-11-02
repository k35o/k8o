import { Badge, Heading } from '@k8ordo/ui';
import { formatDate } from '@repo/helpers/date/format';
import type { FC } from 'react';

import type { BrowserSupportFeatureChange } from '@/features/browser-support/interface/queries';

import styles from './browser-support-recent-changes.module.css';

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
    <section className={styles.root}>
      <Heading level="h3">最近の更新</Heading>
      <div className={styles.groups}>
        {groupBySyncBatch(changes).map((group) => (
          <div
            className={styles.group}
            key={`${group.upstreamVersion}-${group.changedAt}`}
          >
            <p className={styles.groupMeta}>
              {formatDate(new Date(group.changedAt))}・v{group.upstreamVersion}
            </p>
            <ul className={styles.changes}>
              {group.changes.map((change) => (
                <li
                  className={styles.change}
                  key={`${change.featureId}-${change.changedAt}`}
                >
                  <Badge
                    size="sm"
                    label={STATUS_LABEL[change.status]}
                    tone={STATUS_TONE[change.status]}
                  />
                  <span className={styles.featureName}>
                    {change.featureName}
                  </span>
                  <span className={styles.previous}>
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
