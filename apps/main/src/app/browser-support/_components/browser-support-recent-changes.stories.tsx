import { expect, within } from 'storybook/test';

import type { BrowserSupportFeatureChange } from '@/features/browser-support/interface/queries';

import preview from '../../../../.storybook/preview';
import { BrowserSupportRecentChanges } from './browser-support-recent-changes';

const change = (
  overrides: Partial<BrowserSupportFeatureChange> &
    Pick<BrowserSupportFeatureChange, 'featureId' | 'featureName'>,
): BrowserSupportFeatureChange => ({
  status: 'newly',
  previousStatus: null,
  upstreamVersion: '3.52.0',
  changedAt: '2026-08-12T06:00:00.000Z',
  ...overrides,
});

const CHANGES: BrowserSupportFeatureChange[] = [
  change({ featureId: 'text-fit', featureName: 'text-fit' }),
  change({
    featureId: 'popover',
    featureName: 'Popover API',
    status: 'widely',
    previousStatus: 'newly',
  }),
  change({
    featureId: 'promise-try',
    featureName: 'Promise.try()',
    upstreamVersion: '3.51.0',
    changedAt: '2026-08-04T06:00:00.000Z',
  }),
];

const meta = preview.meta({
  title: 'app/browser-support/browser-support-recent-changes',
  component: BrowserSupportRecentChanges,
  args: {
    changes: CHANGES,
  },
});

export const Primary = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('最近の更新')).toBeInTheDocument();
    // 同期(バージョン)単位でグループ化される
    await expect(
      canvas.getByText('2026年8月12日(水)・v3.52.0'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('2026年8月4日(火)・v3.51.0'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('text-fit')).toBeInTheDocument();
    await expect(canvas.getByText('Promise.try()')).toBeInTheDocument();
  },
});

export const StatusChange = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // baseline 内の遷移は変更前ステータスを添える
    await expect(canvas.getByText('Newly から')).toBeInTheDocument();
    await expect(canvas.getAllByText('Baseline 到達')).toHaveLength(2);
  },
});

export const SameVersionResync = meta.story({
  args: {
    changes: [
      change({
        featureId: 'feature-a',
        featureName: 'feature-a',
        changedAt: '2026-08-12T06:00:00.000Z',
      }),
      change({
        featureId: 'feature-b',
        featureName: 'feature-b',
        changedAt: '2026-08-10T06:00:00.000Z',
      }),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 強制再同期で同一バージョンが別時刻に記録された場合は別グループとして表示する
    await expect(
      canvas.getByText('2026年8月12日(水)・v3.52.0'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('2026年8月10日(月)・v3.52.0'),
    ).toBeInTheDocument();
  },
});

export const Empty = meta.story({
  args: {
    changes: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 履歴が無いときはセクションごと表示しない
    await expect(canvas.queryByText('最近の更新')).toBeNull();
  },
});
