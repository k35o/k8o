import { HttpResponse, http } from 'msw/http';
import { expect, fn, waitFor } from 'storybook/test';

import type {
  BrowserSupportFeature,
  BrowserSupportSnapshot,
} from '@/features/browser-support/interface/queries';

import preview from '../../../../.storybook/preview';
import { BrowserSupportLive } from './browser-support-live';

const SNAPSHOT_URL = 'https://api.k8o.me/public/browser-support';

const allBrowsers = (version: string): BrowserSupportFeature['support'] =>
  (
    [
      'chrome',
      'chrome_android',
      'edge',
      'firefox',
      'firefox_android',
      'safari',
      'safari_ios',
    ] as const
  ).map((browser) => ({ browser, version, date: '2024-01-01' }));

const popover: BrowserSupportFeature = {
  featureId: 'popover',
  name: 'Popover API',
  status: 'widely',
  baselineDate: '2026-10-01',
  resolvedDate: '2026-10-01',
  support: allBrowsers('114'),
};

const iteratorConcat: BrowserSupportFeature = {
  featureId: 'iterator-concat',
  name: 'Iterator.concat()',
  status: 'newly',
  baselineDate: '2026-10-21',
  resolvedDate: '2026-10-21',
  support: allBrowsers('146'),
};

const buildTime: BrowserSupportSnapshot = {
  meta: { upstreamVersion: '3.52.0', ingestedAt: '2026-10-20T06:00:00.000Z' },
  features: [popover],
  recentChanges: [
    {
      featureId: 'popover',
      featureName: 'Popover API',
      status: 'widely',
      previousStatus: 'newly',
      upstreamVersion: '3.52.0',
      changedAt: '2026-10-20T06:00:00.000Z',
    },
  ],
  nowMs: new Date('2026-10-20T06:00:00.000Z').getTime(),
};

// ビルドのあと、api の同期で Iterator.concat() が Baseline に入った
const latest: BrowserSupportSnapshot = {
  meta: { upstreamVersion: '3.53.0', ingestedAt: '2026-10-22T06:00:00.000Z' },
  features: [iteratorConcat, popover],
  recentChanges: [
    {
      featureId: 'iterator-concat',
      featureName: 'Iterator.concat()',
      status: 'newly',
      previousStatus: null,
      upstreamVersion: '3.53.0',
      changedAt: '2026-10-22T06:00:00.000Z',
    },
    ...buildTime.recentChanges,
  ],
  nowMs: new Date('2026-10-22T06:00:00.000Z').getTime(),
};

const requested = fn();

const meta = preview.meta({
  title: 'app/browser-support/browser-support-live',
  component: BrowserSupportLive,
  args: { snapshot: buildTime, blogMap: {} },
  beforeEach: () => {
    requested.mockClear();
  },
});

export const Replaced = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.get(SNAPSHOT_URL, () => HttpResponse.json(latest)));
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('2026年10月22日(木)・v3.53.0'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/v3\.53\.0（2026年10月22日\(木\) 取得）/u),
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByText('Iterator.concat()').length,
    ).toBeGreaterThan(1);
  },
});

export const KeepsBuildTimeOnFailure = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(SNAPSHOT_URL, () => {
        requested();
        return HttpResponse.json(
          { ok: false, error: 'internal_error' },
          { status: 500 },
        );
      }),
    );
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(requested).toHaveBeenCalledOnce();
    });
    await expect(
      canvas.getByText(/v3\.52\.0（2026年10月20日\(火\) 取得）/u),
    ).toBeInTheDocument();
    await expect(canvas.queryByText('Iterator.concat()')).toBeNull();
  },
});

export const Syncing = meta.story({
  args: {
    snapshot: { meta: null, features: [], recentChanges: [], nowMs: 0 },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText(
        'データを同期しています。しばらくしてから再度アクセスしてください。',
      ),
    ).toBeInTheDocument();
  },
});

export const ReplacesSyncing = meta.story({
  args: {
    snapshot: { meta: null, features: [], recentChanges: [], nowMs: 0 },
  },
  beforeEach: ({ msw }) => {
    msw.use(http.get(SNAPSHOT_URL, () => HttpResponse.json(latest)));
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(/v3\.53\.0（2026年10月22日\(木\) 取得）/u),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText(
        'データを同期しています。しばらくしてから再度アクセスしてください。',
      ),
    ).toBeNull();
  },
});
