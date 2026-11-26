import { expect, userEvent } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import {
  expectParamInUrl,
  mountStoryUrl,
} from '../../../../.storybook/url-state-story';
import type {
  ReadingArticle,
  ReadingDay,
} from '../reading-list-source/reading-list-source';
import { ReadingListContent } from './reading-list-content';

const tanstack: ReadingArticle = {
  id: 2,
  title: 'TanStack Routerで型安全なルーティング',
  url: 'https://zenn.dev/example/articles/tanstack-router',
  publishedAt: '2026-10-20T00:00:00.000Z',
  imageUrl: null,
  summary: 'TanStack Routerの使い方を紹介します。',
  description: null,
  sourceTitle: 'Zenn',
};

const baseline: ReadingArticle = {
  id: 1,
  title: 'Baseline 2026 のふりかえり',
  url: 'https://web.dev/articles/baseline-2026',
  publishedAt: '2026-10-18T00:00:00.000Z',
  imageUrl: null,
  summary: '2026年に Baseline に入った機能をまとめた記事。',
  description: null,
  sourceTitle: 'web.dev',
};

const days: ReadingDay[] = [
  {
    date: '2026-10-20',
    articleCount: 1,
    overview: 'ルーティングの記事が1件の日。',
    picks: [],
    topics: [
      {
        kind: 'explainer',
        headline: 'TanStack Router の使い方の紹介が出た',
        articles: [tanstack],
      },
    ],
    remainingArticles: [],
  },
  {
    date: '2026-10-18',
    articleCount: 1,
    overview: null,
    picks: [],
    topics: [],
    remainingArticles: [baseline],
  },
];

// 連載の記事を 1 日の 1 つの話題に入れる
const series: ReadingDay[] = [
  {
    date: '2026-10-30',
    articleCount: 30,
    overview: null,
    picks: [],
    topics: [
      {
        kind: 'other',
        headline: 'この日の記事',
        articles: Array.from({ length: 30 }, (_, index) => ({
          id: 100 + index,
          title: `連載 第${String(index + 1)}回`,
          url: `https://zenn.dev/example/articles/series-${String(index + 1)}`,
          publishedAt: new Date(
            Date.UTC(2026, 9, 30, 0, 0, 0) - index * 60_000,
          ).toISOString(),
          imageUrl: null,
          summary: null,
          description: null,
          sourceTitle: 'Zenn',
        })),
      },
    ],
    remainingArticles: [],
  },
];

const meta = preview.meta({
  title: 'app/reading-list/reading-list-content',
  component: ReadingListContent,
  args: { days },
  beforeEach: mountStoryUrl,
});

// 正常系: 検索していないあいだは、日ごとのまとめで見せる
export const ShowsDigestByDefault = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByText('2件の記事')).toBeInTheDocument();
    const topic = canvas.getByRole('button', {
      name: /TanStack Router の使い方の紹介が出た/u,
    });
    await expect(
      canvas.queryByRole('link', {
        name: 'TanStack Routerで型安全なルーティング',
      }),
    ).toBeNull();

    await userEvent.click(topic);

    await expect(
      canvas.getByRole('link', {
        name: 'TanStack Routerで型安全なルーティング',
      }),
    ).toBeVisible();
  },
});

// 正常系: 検索しているあいだは、当たった記事を公開日を添えて新しい順に並べる
export const SearchesTitleAndSource = meta.story({
  parameters: { query: 'q=web.dev' },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('1件の記事')).toBeInTheDocument();
    await expect(
      canvas.getByRole('textbox', { name: '記事を検索' }),
    ).toHaveValue('web.dev');
    await expect(
      canvas.getByRole('link', { name: 'Baseline 2026 のふりかえり' }),
    ).toBeVisible();
    await expect(canvas.getByText('web.dev・2026年10月18日')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: /この日の記事/u }),
    ).toBeNull();
  },
});

export const SearchBeyondFirstPaint = meta.story({
  args: { days: series },
  parameters: { query: 'q=第29回' },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('連載 第29回')).toBeInTheDocument();
    await expect(canvas.getByText('1件の記事')).toBeInTheDocument();
  },
});

// 正常系: 打った語は、履歴を増やさずに URL の q に書く
export const WriteQueryToUrl = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const entries = navigation.entries().length;

    await userEvent.type(
      canvas.getByRole('textbox', { name: '記事を検索' }),
      'zenn',
    );

    await expectParamInUrl('q', 'zenn');
    await expect(
      await canvas.findByRole('link', {
        name: 'TanStack Routerで型安全なルーティング',
      }),
    ).toBeVisible();
    await expect(navigation.entries()).toHaveLength(entries);
  },
});

// 異常系: 当たる記事が無ければ、そう案内する
export const NoResults = meta.story({
  parameters: { query: 'q=Firefox' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('条件に一致する記事がありません'),
    ).toBeVisible();
    await expect(canvas.getByText('0件の記事')).toBeInTheDocument();
  },
});
