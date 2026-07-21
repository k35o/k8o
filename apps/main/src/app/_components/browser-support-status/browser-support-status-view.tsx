import {
  Badge,
  ChromeIcon,
  EdgeIcon,
  FirefoxIcon,
  SafariIcon,
} from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';

import type {
  BrowserSupportFeature,
  SupportStatus,
} from '@/features/browser-support/interface/queries';

import { toBrowserFamilies } from './browser-families';

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
    <div className="border-border-base bg-bg-base my-4 flex max-w-full flex-col gap-3 rounded-xl border p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge size="sm" text={meta.label} tone={meta.tone} />
        <span className="text-sm font-medium">{feature.name}</span>
        {year !== null && (
          <span className="text-fg-mute text-xs">{year}年〜</span>
        )}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {families.map((family) => {
          const Icon = FAMILY_ICON[family.label];
          return (
            <li
              // 未対応はロゴの色・形は変えず、要素ごと不透明度を落として表す。
              className={cn(
                'flex items-center gap-1.5 text-xs',
                !family.supported && 'opacity-40',
              )}
              key={family.label}
            >
              {Icon && <Icon size="sm" />}
              {/* アイコンには名前が無いので、ブラウザ名は読み上げ用に補う。 */}
              <span className="sr-only">{family.label}</span>
              <span
                className={cn(
                  'font-mono',
                  family.supported ? 'text-fg-base' : 'text-fg-mute',
                )}
              >
                {family.supported ? (family.version ?? '対応') : '未対応'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
