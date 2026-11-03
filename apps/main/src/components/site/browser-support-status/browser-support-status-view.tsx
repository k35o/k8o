import {
  Badge,
  ChromeIcon,
  EdgeIcon,
  FirefoxIcon,
  SafariIcon,
} from '@k8ordo/ui';
import type { FC } from 'react';

import type {
  BrowserSupportFeature,
  SupportStatus,
} from '@/features/browser-support/interface/queries';

import { toBrowserFamilies } from './browser-families';

import styles from './browser-support-status-view.module.css';

const STATUS_META: Record<
  SupportStatus,
  { label: string; tone: 'success' | 'info' | 'warning' }
> = {
  widely: { label: 'Widely available', tone: 'success' },
  newly: { label: 'Newly available', tone: 'info' },
  limited: { label: 'Limited availability', tone: 'warning' },
};

const FAMILY_ICON: Record<string, typeof ChromeIcon> = {
  Chrome: ChromeIcon,
  Edge: EdgeIcon,
  Firefox: FirefoxIcon,
  Safari: SafariIcon,
};

export const BrowserSupportStatusView: FC<{
  feature: BrowserSupportFeature | null;
}> = ({ feature }) => {
  if (feature === null) {
    return null;
  }

  const meta = STATUS_META[feature.status];
  const families = toBrowserFamilies(feature.support);
  const year =
    feature.baselineDate === null ? null : feature.baselineDate.slice(0, 4);

  return (
    <div className={styles.root}>
      <div className={styles.summary}>
        <Badge size="sm" label={meta.label} tone={meta.tone} />
        <span className={styles.name}>{feature.name}</span>
        {year !== null && <span className={styles.year}>{year}年〜</span>}
      </div>
      <ul className={styles.families}>
        {families.map((family) => {
          const Icon = FAMILY_ICON[family.label];
          return (
            <li
              className={styles.family}
              // 未対応はロゴの色・形は変えず、要素ごと不透明度を落として表す。
              data-supported={family.supported}
              key={family.label}
            >
              {Icon && <Icon size="sm" />}
              {/* アイコンには名前が無いので、ブラウザ名は読み上げ用に補う。 */}
              <span className={styles.srOnly}>{family.label}</span>
              <span className={styles.version}>
                {family.supported ? (family.version ?? '対応') : '未対応'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
