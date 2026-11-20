import { expect, within } from 'storybook/test';

import type { ActivityItem } from '@/features/activity/interface/queries';

import preview from '../../../../.storybook/preview';
import { ActivityFeed } from './activity-feed';

const items: ActivityItem[] = [
  {
    kind: 'talk',
    id: 'talk:7',
    date: '2026-11-22',
    title:
      'Panda CSSにみる、ライブラリを直接importしないCSS in JSだからできること',
    eventName: 'JSConf JP 2026',
    href: 'https://example.com/jsconf',
    upcoming: true,
  },
  {
    kind: 'release',
    id: 'release:@k8ordo/ui:3.0.0',
    date: '2026-11-13T02:00:00.000Z',
    packageName: '@k8ordo/ui',
    version: '3.0.0',
    href: 'https://github.com/k35o/k8ordo/releases',
  },
  {
    kind: 'blog',
    id: 'blog:scroll-state-queries',
    date: '2026-11-10T09:12:00.000Z',
    title: 'スクロールの状態で見た目を変えるscroll-state()',
    href: '/blog/scroll-state-queries',
  },
  {
    kind: 'release',
    id: 'release:vite-plus-inspector:1.0.0',
    date: '2026-09-30T02:00:00.000Z',
    packageName: 'vite-plus-inspector',
    version: '1.0.0',
    href: 'https://github.com/k35o/vite-plus-inspector/releases',
  },
  {
    kind: 'talk',
    id: 'talk:6',
    date: '2026-09-12',
    title: 'CSSの新機能を追いかける',
    eventName: 'フロントエンドカンファレンス',
    href: '/talks/css-new-features',
    upcoming: false,
  },
];

const meta = preview.meta({
  title: 'app/globals/activity-feed',
  component: ActivityFeed,
  args: { items },
});

export const Primary = meta.story({
  play: async ({ canvas }) => {
    const rows = canvas.getAllByRole('listitem').map((row) => row.textContent);
    await expect(rows).toStrictEqual([
      'Panda CSSにみる、ライブラリを直接importしないCSS in JSだからできること（新しいタブで開く）Talk予定JSConf JP 202611月22日',
      '@k8ordo/ui 3.0.0（新しいタブで開く）Release11月13日',
      'スクロールの状態で見た目を変えるscroll-state()Blog11月10日',
      'vite-plus-inspector 1.0.0（新しいタブで開く）Release9月30日',
      'CSSの新機能を追いかけるTalkフロントエンドカンファレンス9月12日',
    ]);
  },
});

export const GroupsRowsByMonth = meta.story({
  play: async ({ canvas }) => {
    const months = canvas
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    await expect(months).toStrictEqual(['2026年11月', '2026年9月']);
    const counts = canvas
      .getAllByRole('list')
      .map((list) => within(list).getAllByRole('listitem').length);
    await expect(counts).toStrictEqual([3, 2]);
  },
});

export const LinksToEachDestination = meta.story({
  play: async ({ canvas }) => {
    const hrefs = canvas
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    await expect(hrefs).toStrictEqual([
      'https://example.com/jsconf',
      'https://github.com/k35o/k8ordo/releases',
      '/blog/scroll-state-queries',
      'https://github.com/k35o/vite-plus-inspector/releases',
      '/talks/css-new-features',
    ]);
  },
});

export const MarksOnlyUpcomingTalk = meta.story({
  play: async ({ canvas }) => {
    const [upcoming, ...rest] = canvas.getAllByRole('listitem');
    if (upcoming === undefined) {
      throw new Error('行がありません');
    }
    await expect(within(upcoming).getByText('予定')).toBeInTheDocument();
    for (const row of rest) {
      await expect(within(row).queryByText('予定')).not.toBeInTheDocument();
    }
  },
});

export const Mobile = meta.story({
  globals: { viewport: { value: 'mobile1' } },
});

export const OpensOnlyExternalLinksInNewTab = meta.story({
  play: async ({ canvas }) => {
    const targets = canvas
      .getAllByRole('link')
      .map((link) => link.getAttribute('target'));
    await expect(targets).toStrictEqual([
      '_blank',
      '_blank',
      null,
      '_blank',
      null,
    ]);
  },
});

export const NamesLinksByTitle = meta.story({
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', {
        name: '@k8ordo/ui 3.0.0 （新しいタブで開く）',
      }),
    ).toHaveAttribute('href', 'https://github.com/k35o/k8ordo/releases');
    await expect(
      canvas.getByRole('link', {
        name: 'スクロールの状態で見た目を変えるscroll-state()',
      }),
    ).toHaveAttribute('href', '/blog/scroll-state-queries');
  },
});

export const ShowsFocusRingOnRow = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const [first] = canvas.getAllByRole('listitem');
    await expect(first).toHaveStyle({ outlineStyle: 'none' });
    await expect(
      first === undefined ? 'none' : getComputedStyle(first).boxShadow,
    ).not.toBe('none');
  },
});
