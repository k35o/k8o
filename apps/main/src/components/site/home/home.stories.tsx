import { expect, waitFor } from 'storybook/test';

import type { ActivityItem } from '@/features/activity/interface/queries';

import preview from '../../../../.storybook/preview';
import { Home } from './home';

const activity: ActivityItem[] = [
  {
    kind: 'talk',
    id: 'talk:7',
    date: '2026-11-22',
    title: 'Panda CSSにみるCSS in JS',
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
    id: 'blog:article-9',
    date: '2026-09-10T09:12:00.000Z',
    title: '9月の記事',
    href: '/blog/article-9',
  },
  {
    kind: 'blog',
    id: 'blog:article-8',
    date: '2026-08-10T09:12:00.000Z',
    title: '8月の記事',
    href: '/blog/article-8',
  },
  {
    kind: 'blog',
    id: 'blog:article-7',
    date: '2026-07-10T09:12:00.000Z',
    title: '7月の記事',
    href: '/blog/article-7',
  },
  {
    kind: 'blog',
    id: 'blog:article-6',
    date: '2026-06-10T09:12:00.000Z',
    title: '6月の記事',
    href: '/blog/article-6',
  },
  {
    kind: 'blog',
    id: 'blog:article-5',
    date: '2026-05-10T09:12:00.000Z',
    title: '5月の記事',
    href: '/blog/article-5',
  },
  {
    kind: 'blog',
    id: 'blog:article-4',
    date: '2026-04-10T09:12:00.000Z',
    title: '4月の記事',
    href: '/blog/article-4',
  },
  {
    kind: 'blog',
    id: 'blog:article-3',
    date: '2026-03-10T09:12:00.000Z',
    title: '3月の記事',
    href: '/blog/article-3',
  },
  {
    kind: 'blog',
    id: 'blog:article-2',
    date: '2026-02-10T09:12:00.000Z',
    title: '2月の記事',
    href: '/blog/article-2',
  },
  {
    kind: 'blog',
    id: 'blog:article-1',
    date: '2026-01-10T09:12:00.000Z',
    title: '1月の記事',
    href: '/blog/article-1',
  },
];

const meta = preview.meta({
  title: 'app/globals/home',
  component: Home,
  args: { activity },
});

export const Primary = meta.story();

export const ShowsNewestEightActivities = meta.story({
  play: async ({ canvas }) => {
    // 9 本目の記事（/blog/article-3）までは出さない
    const hrefs = canvas
      .getAllByRole('link')
      .map((link) => link.getAttribute('href') ?? '')
      .filter(
        (href) =>
          href.startsWith('/blog/article-') ||
          href === 'https://example.com/jsconf' ||
          href === 'https://github.com/k35o/k8ordo/releases',
      );
    await expect(hrefs).toStrictEqual([
      'https://example.com/jsconf',
      'https://github.com/k35o/k8ordo/releases',
      '/blog/article-9',
      '/blog/article-8',
      '/blog/article-7',
      '/blog/article-6',
      '/blog/article-5',
      '/blog/article-4',
    ]);
  },
});

export const KeepsActivityHeadingForHeadingNavigation = meta.story({
  play: async ({ canvas }) => {
    // 見た目には出さないが、月の見出し（h3）の親として読み上げには残す
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Activity' }),
    ).toBeInTheDocument();
  },
});

export const LoadsIconAtDisplaySize = meta.story({
  play: async ({ canvas }) => {
    const icon = canvas.getByRole('img', { name: 'k8oのアイコン' });
    // Storybook の幅（1200px）と DPR 1 では、アイコンは 128px で描かれる
    await waitFor(async () => {
      await expect(
        icon instanceof HTMLImageElement ? icon.currentSrc : '',
      ).toMatch(/\/k8o\.128w\.avif/u);
    });
  },
});
