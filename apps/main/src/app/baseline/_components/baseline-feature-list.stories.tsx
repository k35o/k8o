import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import type {
  BaselineFeature,
  BlogLink,
} from '@/features/baseline/interface/queries';

import { BaselineFeatureList } from './baseline-feature-list';

const now = Date.now();
const toIso = (offsetMs: number): string =>
  new Date(now - offsetMs).toISOString();
const DAY_MS = 24 * 60 * 60 * 1000;

const FEATURES: BaselineFeature[] = [
  {
    featureId: 'popover',
    name: 'Popover API',
    status: 'widely',
    date: '2026-01-27',
    updatedAt: toIso(2 * DAY_MS),
  },
  {
    featureId: 'view-transitions',
    name: 'View transitions',
    status: 'widely',
    date: '2026-01-14',
    updatedAt: toIso(30 * DAY_MS),
  },
  {
    featureId: 'font-family-math',
    name: 'Math font family',
    status: 'newly',
    date: '2026-03-24',
    updatedAt: toIso(3 * DAY_MS),
  },
  {
    featureId: 'iterator-concat',
    name: 'Iterator.concat()',
    status: 'newly',
    date: '2026-03-24',
    updatedAt: toIso(30 * DAY_MS),
  },
  {
    featureId: 'scope',
    name: '@scope',
    status: 'widely',
    date: '2025-09-27',
    updatedAt: toIso(60 * DAY_MS),
  },
  {
    featureId: 'promise-try',
    name: 'Promise.try()',
    status: 'newly',
    date: '2025-07-02',
    updatedAt: toIso(90 * DAY_MS),
  },
  {
    featureId: 'highlight',
    name: 'Custom highlight',
    status: 'newly',
    date: '2025-03-12',
    updatedAt: toIso(180 * DAY_MS),
  },
];

const BLOG_MAP: Record<string, BlogLink> = {
  popover: { slug: 'popover', title: 'Popover APIを使ってみよう' },
  'font-family-math': {
    slug: 'font-family-math',
    title: 'font-family: mathの紹介',
  },
  scope: { slug: 'scope', title: '@scopeの使い方' },
  'promise-try': {
    slug: 'promise-try',
    title: 'Promise.try()が来た',
  },
  highlight: { slug: 'highlight', title: 'Custom Highlightの紹介' },
};

const meta: Meta<typeof BaselineFeatureList> = {
  title: 'app/baseline/baseline-feature-list',
  component: BaselineFeatureList,
  args: {
    features: FEATURES,
    blogMap: BLOG_MAP,
    currentYear: '2026',
  },
};

export default meta;
type Story = StoryObj<typeof BaselineFeatureList>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: '検索' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('checkbox', { name: 'Newly Available' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('checkbox', { name: 'Widely Available' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('tablist', { name: '年を選択' }),
    ).toBeInTheDocument();
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

export const FilterByNewlyOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const widelyCheckbox = canvas.getByRole('checkbox', {
      name: 'Widely Available',
    });
    await userEvent.click(widelyCheckbox);
    await expect(canvas.queryByText('Popover API')).toBeNull();
    await expect(canvas.getByText('Math font family')).toBeInTheDocument();
  },
};

export const FilterByWidelyOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const newlyCheckbox = canvas.getByRole('checkbox', {
      name: 'Newly Available',
    });
    await userEvent.click(newlyCheckbox);
    await expect(canvas.getByText('Popover API')).toBeInTheDocument();
    await expect(canvas.queryByText('Math font family')).toBeNull();
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
    const recentCheckbox = canvas.getByRole('checkbox', {
      name: '直近1週間の更新のみ',
    });
    await userEvent.click(recentCheckbox);
    await expect(canvas.getByText('Popover API')).toBeInTheDocument();
    await expect(canvas.getByText('Math font family')).toBeInTheDocument();
    await expect(canvas.queryByText('View transitions')).toBeNull();
    await expect(canvas.queryByText('Iterator.concat()')).toBeNull();
  },
};
