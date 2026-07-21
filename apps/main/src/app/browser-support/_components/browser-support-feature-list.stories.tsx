import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { BlogLink } from '@/features/blog/interface/queries';
import type { BrowserSupportFeature } from '@/features/browser-support/interface/queries';

import { BrowserSupportFeatureList } from './browser-support-feature-list';

// VRTを決定的にするため実行日時ではなく固定基準日を使う。args はモジュール評価時に
// 走り mockingDate では固定できず、BrowserSupportFeatureList は nowMs で時刻を注入されるため
const now = new Date('2026-07-01T00:00:00Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;
const toDate = (offsetMs: number): string =>
  new Date(now - offsetMs).toISOString().slice(0, 10);

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

const chromeOnly: BrowserSupportFeature['support'] = [
  { browser: 'chrome', version: '150', date: '2026-06-30' },
  { browser: 'chrome_android', version: '150', date: '2026-06-30' },
  { browser: 'edge', version: '150', date: '2026-06-30' },
];

const FEATURES: BrowserSupportFeature[] = [
  {
    featureId: 'popover',
    name: 'Popover API',
    status: 'widely',
    baselineDate: toDate(2 * DAY_MS),
    resolvedDate: toDate(2 * DAY_MS),
    support: allBrowsers('114'),
  },
  {
    featureId: 'view-transitions',
    name: 'View transitions',
    status: 'widely',
    baselineDate: toDate(10 * DAY_MS),
    resolvedDate: toDate(10 * DAY_MS),
    support: allBrowsers('111'),
  },
  {
    featureId: 'font-family-math',
    name: 'Math font family',
    status: 'newly',
    baselineDate: toDate(3 * DAY_MS),
    resolvedDate: toDate(3 * DAY_MS),
    support: allBrowsers('133'),
  },
  {
    featureId: 'iterator-concat',
    name: 'Iterator.concat()',
    status: 'newly',
    baselineDate: toDate(10 * DAY_MS),
    resolvedDate: toDate(10 * DAY_MS),
    support: allBrowsers('146'),
  },
  {
    featureId: 'text-fit',
    name: 'text-fit',
    status: 'limited',
    baselineDate: null,
    resolvedDate: toDate(DAY_MS),
    support: chromeOnly,
  },
  {
    featureId: 'scope',
    name: '@scope',
    status: 'widely',
    baselineDate: '2025-09-27',
    resolvedDate: '2025-09-27',
    support: allBrowsers('118'),
  },
  {
    featureId: 'promise-try',
    name: 'Promise.try()',
    status: 'newly',
    baselineDate: '2025-07-02',
    resolvedDate: '2025-07-02',
    support: allBrowsers('134'),
  },
];

const BLOG_MAP: Record<string, BlogLink> = {
  popover: { slug: 'popover', title: 'Popover APIを使ってみよう' },
  'font-family-math': {
    slug: 'font-family-math',
    title: 'font-family: mathの紹介',
  },
  scope: { slug: 'scope', title: '@scopeの使い方' },
  'promise-try': { slug: 'promise-try', title: 'Promise.try()が来た' },
};

const meta: Meta<typeof BrowserSupportFeatureList> = {
  title: 'app/browser-support/browser-support-feature-list',
  component: BrowserSupportFeatureList,
  args: {
    features: FEATURES,
    blogMap: BLOG_MAP,
    currentYear: toDate(0).slice(0, 4),
    nowMs: now,
  },
};

export default meta;
type Story = StoryObj<typeof BrowserSupportFeatureList>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: '検索' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('checkbox', { name: 'Widely' }),
    ).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Newly' })).toBeChecked();
    await expect(
      canvas.getByRole('checkbox', { name: 'Limited（先取り）' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('tablist', { name: '年を選択' }),
    ).toBeInTheDocument();
  },
};

export const ShowsBrowserSupport: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Limited の text-fit は Chrome 対応・Safari 未対応が並ぶ。
    await expect(canvas.getAllByText('text-fit').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('Safari').length).toBeGreaterThan(0);
  },
};

export const FilterBySearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox', { name: '検索' });
    await userEvent.type(searchInput, 'popover');
    await expect(canvas.getByText('Popover API')).toBeInTheDocument();
    await expect(canvas.queryByText('Iterator.concat()')).toBeNull();
  },
};

export const FilterOutLimited: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 先取り(Limited)を外すと text-fit が消え、Widely/Newly は残る。
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Limited（先取り）' }),
    );
    await expect(canvas.queryByText('text-fit')).toBeNull();
    await expect(canvas.getByText('Popover API')).toBeInTheDocument();
  },
};

export const BlogLinkDisplayed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const blogLinks = canvas.getAllByText('Blog');
    await expect(blogLinks.length).toBeGreaterThan(0);
  },
};

export const EmptyResult: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox', { name: '検索' });
    await userEvent.type(searchInput, 'zzzznotfound');
    await expect(
      canvas.getByText('該当する機能が見つかりません'),
    ).toBeInTheDocument();
  },
};

export const FilterByRecentOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: '直近1週間の更新のみ' }),
    );
    await expect(canvas.getByText('Popover API')).toBeInTheDocument();
    await expect(canvas.getAllByText('text-fit').length).toBeGreaterThan(0);
    await expect(canvas.queryByText('View transitions')).toBeNull();
  },
};
