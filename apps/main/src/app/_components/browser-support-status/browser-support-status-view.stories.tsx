import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import type { BrowserSupportFeature } from '@/features/browser-support/interface/queries';

import { BrowserSupportStatusView } from './browser-support-status-view';

const allBrowsers = (version: string): BrowserSupportFeature['support'] => [
  { browser: 'chrome', version, date: '2024-01-01' },
  { browser: 'chrome_android', version, date: '2024-01-01' },
  { browser: 'edge', version, date: '2024-01-01' },
  { browser: 'firefox', version, date: '2024-01-01' },
  { browser: 'firefox_android', version, date: '2024-01-01' },
  { browser: 'safari', version, date: '2024-01-01' },
  { browser: 'safari_ios', version, date: '2024-01-01' },
];

const widely: BrowserSupportFeature = {
  featureId: 'popover',
  name: 'Popover API',
  status: 'widely',
  baselineDate: '2024-01-29',
  resolvedDate: '2024-01-29',
  support: allBrowsers('114'),
};

const newly: BrowserSupportFeature = {
  featureId: 'iterator-concat',
  name: 'Iterator.concat()',
  status: 'newly',
  baselineDate: '2026-03-24',
  resolvedDate: '2026-03-24',
  support: allBrowsers('146'),
};

// Chrome/Edge のみ対応、Firefox/Safari 未対応の先取り機能。
const limited: BrowserSupportFeature = {
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

const meta: Meta<typeof BrowserSupportStatusView> = {
  title: 'app/globals/browser-support-status',
  component: BrowserSupportStatusView,
  args: { feature: widely },
};

export default meta;
type Story = StoryObj<typeof BrowserSupportStatusView>;

export const Widely: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Widely available')).toBeInTheDocument();
    await expect(canvas.getByText('Popover API')).toBeInTheDocument();
    await expect(canvas.getByText('2024年〜')).toBeInTheDocument();
  },
};

export const Newly: Story = {
  args: { feature: newly },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Newly available')).toBeInTheDocument();
    await expect(canvas.getByText('Iterator.concat()')).toBeInTheDocument();
  },
};

export const Limited: Story = {
  args: { feature: limited },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Limited availability')).toBeInTheDocument();
    await expect(canvas.getByText('Safari')).toBeInTheDocument();
    await expect(canvas.getAllByText('未対応').length).toBeGreaterThan(0);
  },
};
