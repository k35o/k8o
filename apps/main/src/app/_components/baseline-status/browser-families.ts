import type { BaselineBrowser } from '@repo/helpers/browser/detect-browser';

import type { BrowserAvailability } from '@/features/baseline/interface/queries';

export type BrowserFamily = {
  label: string;
  supported: boolean;
  version: string | null;
};

// デスクトップ/モバイルを1系統にまとめる。系統が「対応」なのは属する全キーが
// 対応しているとき（Baseline の定義に合わせる）。
const FAMILIES: Array<{
  label: string;
  keys: BaselineBrowser[];
  primary: BaselineBrowser;
}> = [
  { label: 'Chrome', keys: ['chrome', 'chrome_android'], primary: 'chrome' },
  { label: 'Edge', keys: ['edge'], primary: 'edge' },
  {
    label: 'Firefox',
    keys: ['firefox', 'firefox_android'],
    primary: 'firefox',
  },
  { label: 'Safari', keys: ['safari', 'safari_ios'], primary: 'safari' },
];

export const toBrowserFamilies = (
  support: BrowserAvailability[],
): BrowserFamily[] => {
  const versions = new Map(support.map((s) => [s.browser, s.version]));
  return FAMILIES.map((family) => {
    const supported = family.keys.every((key) => versions.has(key));
    return {
      label: family.label,
      supported,
      version: supported ? (versions.get(family.primary) ?? null) : null,
    };
  });
};
