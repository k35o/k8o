import { HttpResponse, http } from 'msw/http';
import { expect, fn, waitFor } from 'storybook/test';

import type { BrowserSupportFeature } from '@/features/browser-support/interface/queries';

import preview from '../../../../.storybook/preview';
import { BrowserSupportStatusLive } from './browser-support-status-live';

const FEATURE_URL =
  'https://api.k8o.me/public/browser-support/features/text-fit';

// ビルドのときは Chrome 系だけが対応していた
const buildTime: BrowserSupportFeature = {
  featureId: 'text-fit',
  name: 'text-fit',
  status: 'limited',
  baselineDate: null,
  resolvedDate: '2026-06-30',
  support: [
    { browser: 'chrome', version: '150', date: '2026-06-30' },
    { browser: 'chrome_android', version: '150', date: '2026-06-30' },
    { browser: 'edge', version: '150', date: '2026-06-30' },
  ],
};

// その後に Firefox と Safari が対応し、Newly になった
const latest: BrowserSupportFeature = {
  ...buildTime,
  status: 'newly',
  baselineDate: '2026-10-20',
  resolvedDate: '2026-10-20',
  support: [
    ...buildTime.support,
    { browser: 'firefox', version: '155', date: '2026-10-20' },
    { browser: 'firefox_android', version: '155', date: '2026-10-20' },
    { browser: 'safari', version: '27', date: '2026-10-20' },
    { browser: 'safari_ios', version: '27', date: '2026-10-20' },
  ],
};

const requested = fn();

const meta = preview.meta({
  title: 'app/globals/browser-support-status-live',
  component: BrowserSupportStatusLive,
  args: { featureId: 'text-fit', feature: buildTime },
  beforeEach: () => {
    requested.mockClear();
  },
});

export const Replaced = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(FEATURE_URL, () => HttpResponse.json({ feature: latest })),
    );
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('Newly available'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('2026年〜')).toBeInTheDocument();
    await expect(canvas.queryByText('未対応')).not.toBeInTheDocument();
  },
});

export const KeepsBuildTimeOnFailure = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(FEATURE_URL, () => {
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
    await expect(canvas.getByText('Limited availability')).toBeInTheDocument();
    await expect(canvas.getAllByText('未対応')).toHaveLength(2);
  },
});
