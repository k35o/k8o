import { HttpResponse, http } from 'msw/http';
import { expect, waitFor } from 'storybook/test';

import type { ActivityItem } from '@/features/activity/interface/queries';

import preview from '../../../../.storybook/preview';
import { resetBaselineChanges } from '../home-baseline/baseline-changes-source';
import type { BaselineChange } from '../home-baseline/baseline-changes-source';
import { resetLatestReadingDay } from '../home-readings/latest-reading-source';
import type { ReadingDay } from '../home-readings/latest-reading-source';
import { Home } from './home';

const LATEST_READING_URL = 'https://api.k8o.me/public/reading-list/latest';
const RECENT_CHANGES_URL =
  'https://api.k8o.me/public/browser-support/recent-changes';

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
];

const latestReading: { day: ReadingDay } = {
  day: {
    date: '2026-11-25',
    articleCount: 13,
    overview:
      'Reactまわりのセキュリティ情報、ビルドの課金の変更、ワークフローの新しいエンジンなど、対応が要る変更が目立ちました。ほかにMCPの拡張、エージェント向けの検索、スタイルクエリの解説の話題がありました。',
    picks: [
      {
        article: {
          id: 1,
          title:
            'This Week In React #307: Security, React Router, Next.js, TanStack Query and more',
          url: 'https://example.com/react-307',
          publishedAt: '2026-11-25T00:00:00.000Z',
          imageUrl: null,
          text: 'React 週刊ニュースレターの第307号。',
          summary: 'React 週刊ニュースレターの第307号。',
          description: null,
          sourceTitle: 'This Week In React',
        },
        reason: '該当版の利用者はアップグレードが要る',
      },
      {
        article: {
          id: 2,
          title: 'Standard builds have moved to usage-based billing',
          url: 'https://example.com/billing',
          publishedAt: '2026-11-25T08:00:00.000Z',
          imageUrl: null,
          text: 'Standard ビルドが従量課金になった。',
          summary: 'Standard ビルドが従量課金になった。',
          description: null,
          sourceTitle: 'Vercel',
        },
        reason: 'ビルド費用の確認が要る',
      },
    ],
    topics: [],
    remainingArticles: [],
  },
};

const recentChanges: { recentChanges: BaselineChange[] } = {
  recentChanges: [
    {
      featureId: 'text-wrap-balance',
      featureName: 'text-wrap: balance',
      status: 'widely',
      previousStatus: 'newly',
      upstreamVersion: '3.47.0',
      changedAt: '2026-11-20T06:00:03.288Z',
    },
    {
      featureId: 'light-dark',
      featureName: 'light-dark()',
      status: 'widely',
      previousStatus: 'newly',
      upstreamVersion: '3.47.0',
      changedAt: '2026-11-20T06:00:03.288Z',
    },
    {
      featureId: 'scroll-driven-animations',
      featureName: 'Scroll-driven animations',
      status: 'newly',
      previousStatus: null,
      upstreamVersion: '3.45.0',
      changedAt: '2026-11-03T06:00:04.769Z',
    },
  ],
};

const meta = preview.meta({
  title: 'app/globals/home',
  component: Home,
  args: {
    activity,
    featureBlogs: {
      'scroll-driven-animations': {
        slug: 'scroll-driven-animations',
        title: 'animation-timelineでスクロール連動アニメーション',
      },
    },
  },
  beforeEach: ({ msw }) => {
    resetLatestReadingDay();
    resetBaselineChanges();
    msw.use(
      http.get(LATEST_READING_URL, () => HttpResponse.json(latestReading)),
      http.get(RECENT_CHANGES_URL, () => HttpResponse.json(recentChanges)),
    );
  },
});

// 正常系: 広い幅では、年表の横の列に Readings と Baseline の動きを並べる
export const Primary = meta.story({
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('heading', { level: 2, name: 'Readings' }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole('heading', {
        level: 2,
        name: 'Baseline の動き',
      }),
    ).toBeInTheDocument();
  },
});

// 正常系: 狭い幅では、紹介の下で 2 枚を横に送り、その下に年表を置く
export const Mobile = meta.story({
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Reactまわり/u)).toBeInTheDocument();
  },
});

export const ShowsNewestEightActivities = meta.story({
  parameters: { vrt: { skip: true } },
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

export const LoadsIconAtDisplaySize = meta.story({
  parameters: { vrt: { skip: true } },
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

// 正常系: 狭い幅で年表の上に並ぶカードは、フォーカスと読み上げでも年表より先に来る
export const ReadsDailyCardsBeforeActivity = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const readings = await canvas.findByRole('heading', {
      level: 2,
      name: 'Readings',
    });
    const activityHeading = canvas.getByRole('heading', {
      level: 2,
      name: 'Activity',
    });
    await expect(
      readings.compareDocumentPosition(activityHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  },
});

// 正常系: Readings はその日の一覧へ、見てほしい記事は新しいタブで元の記事へつなぐ
export const LinksReadingsToTheDay = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('link', { name: 'この日のReadingsを見る' }),
    ).toHaveAttribute('href', '/reading-list#2026-11-25');
    const pick = canvas.getByRole('link', {
      name: 'Standard builds have moved to usage-based billing （新しいタブで開く）',
    });
    await expect(pick).toHaveAttribute('href', 'https://example.com/billing');
    await expect(pick).toHaveAttribute('target', '_blank');
  },
});

// 正常系: Baseline の動きは、その機能を書いた記事があればつなぎ、無ければリンクを出さない
export const LinksBaselineChangesToArticles = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('link', {
        name: 'Scroll-driven animationsの記事',
      }),
    ).toHaveAttribute('href', '/blog/scroll-driven-animations');
    await expect(
      canvas.queryByRole('link', { name: 'light-dark()の記事' }),
    ).not.toBeInTheDocument();
  },
});

// 正常系: 届くまでは見出しだけの骨組みを出し、読み込み中と伝える
export const WaitsWithSkeleton = meta.story({
  parameters: { vrt: { skip: true } },
  beforeEach: ({ msw }) => {
    const { promise, resolve } = Promise.withResolvers<undefined>();
    msw.use(
      http.get(LATEST_READING_URL, async () => {
        await promise;
        return HttpResponse.json(latestReading);
      }),
    );
    return () => {
      resolve(undefined);
    };
  },
  play: async ({ canvas }) => {
    const heading = await canvas.findByRole('heading', {
      level: 2,
      name: 'Readings',
    });
    await expect(heading.closest('[aria-busy="true"]')).not.toBeNull();
    await expect(canvas.queryByText(/Reactまわり/u)).not.toBeInTheDocument();
  },
});

// 異常系: api を読めなければ、カードごと出さずに年表だけを描く
export const HidesDailyCardsWhenApiFails = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(LATEST_READING_URL, () =>
        HttpResponse.json({ ok: false }, { status: 503 }),
      ),
      http.get(RECENT_CHANGES_URL, () =>
        HttpResponse.json({ ok: false }, { status: 503 }),
      ),
    );
  },
  play: async ({ canvas, canvasElement }) => {
    await waitFor(async () => {
      await expect(
        canvasElement.querySelector('[aria-busy="true"]'),
      ).toBeNull();
    });
    await expect(
      canvas.queryByRole('heading', { name: 'Readings' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('heading', { name: 'Baseline の動き' }),
    ).not.toBeInTheDocument();
  },
});

// エッジケース: 直近 30 日に Baseline の動きが無ければ、Readings だけを出す
export const HidesBaselineWithoutRecentChanges = meta.story({
  globals: { viewport: { value: 'mobile1' } },
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(RECENT_CHANGES_URL, () =>
        HttpResponse.json({ recentChanges: [] }),
      ),
    );
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(await canvas.findByText(/Reactまわり/u)).toBeInTheDocument();
    await waitFor(async () => {
      await expect(
        canvasElement.querySelector('[aria-busy="true"]'),
      ).toBeNull();
    });
    await expect(
      canvas.queryByRole('heading', { name: 'Baseline の動き' }),
    ).not.toBeInTheDocument();
  },
});

// エッジケース: 見てほしい記事の無い日は、全体像だけを出す
export const ShowsOverviewWithoutPicks = meta.story({
  parameters: { vrt: { skip: true } },
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(LATEST_READING_URL, () =>
        HttpResponse.json({ day: { ...latestReading.day, picks: [] } }),
      ),
    );
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(/Reactまわり/u)).toBeInTheDocument();
    await expect(
      canvas.queryByRole('heading', { name: '見てほしい' }),
    ).not.toBeInTheDocument();
  },
});
