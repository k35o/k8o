import { Router, defineRoutes } from '@k8ordo/router';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import { expect, spyOn, userEvent, waitFor } from 'storybook/test';

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
  text: 'TanStack Routerの使い方を紹介します。',
  sourceTitle: 'Zenn',
};

const baseline: ReadingArticle = {
  id: 1,
  title: 'Baseline 2026 のふりかえり',
  url: 'https://web.dev/articles/baseline-2026',
  publishedAt: '2026-10-18T00:00:00.000Z',
  imageUrl: null,
  text: '2026年に Baseline に入った機能をまとめた記事。',
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
  },
  {
    date: '2026-10-18',
    articleCount: 1,
    overview: null,
    picks: [],
    topics: [{ kind: 'other', headline: 'この日の記事', articles: [baseline] }],
  },
];

// 連載の記事を 1 日の 1 つの話題に入れる。「連載」で検索すると全件が当たる
const seriesOf = (length: number): ReadingDay[] => [
  {
    date: '2026-10-30',
    articleCount: length,
    overview: null,
    picks: [],
    topics: [
      {
        kind: 'other',
        headline: 'この日の記事',
        articles: Array.from({ length }, (_, index) => ({
          id: 100 + index,
          title: `連載 第${String(index + 1)}回`,
          url: `https://zenn.dev/example/articles/series-${String(index + 1)}`,
          publishedAt: new Date(
            Date.UTC(2026, 9, 30, 0, 0, 0) - index * 60_000,
          ).toISOString(),
          imageUrl: null,
          text: null,
          sourceTitle: 'Zenn',
        })),
      },
    ],
  },
];

// 初めの描画で先頭だけを描く件数より多い
const series = seriesOf(30);

// 先頭の 20 件のあと、50 件ずつ 2 回足して描き終える
const longSeries = seriesOf(120);

const SEARCHING_SERIES = 'q=連載';

// 一覧はフレームごとに描き足すので、フレームを止めて Story の手で 1 つずつ進める
let heldFrames = new Map<number, FrameRequestCallback>();

const holdFrames = (): (() => void) => {
  let lastId = 0;
  heldFrames = new Map();
  const request = spyOn(window, 'requestAnimationFrame').mockImplementation(
    (callback) => {
      lastId += 1;
      heldFrames.set(lastId, callback);
      return lastId;
    },
  );
  const cancel = spyOn(window, 'cancelAnimationFrame').mockImplementation(
    (id) => {
      heldFrames.delete(id);
    },
  );
  return () => {
    request.mockRestore();
    cancel.mockRestore();
  };
};

const advanceFrame = (): void => {
  const callbacks = [...heldFrames.values()];
  heldFrames = new Map();
  for (const callback of callbacks) {
    callback(performance.now());
  }
};

// 描き直しが続くなら、この間に終わる
const settle = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 200);
  });

const READING_LIST_PATHNAME = '/reading-list';

const Elsewhere: FC = () => <p>別のページ</p>;

// 戻る・進むの位置を戻すのは router なので、<Router> の下で一覧を開き直す
const UnderRouter: FC<{ children: ReactNode }> = ({ children }) => {
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [routes] = useState(() =>
    defineRoutes({
      [READING_LIST_PATHNAME]: () => children,
      '/elsewhere': Elsewhere,
    }),
  );
  return <Router routes={routes} />;
};

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

export const RendersAllResults = meta.story({
  args: { days: series },
  parameters: { query: SEARCHING_SERIES },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('連載 第30回')).toBeInTheDocument();
    await expect(canvas.getAllByRole('link')).toHaveLength(30);
    await expect(canvas.getByText('30件の記事')).toBeInTheDocument();
  },
});

// 正常系: 初めは先頭の 20 件だけを描き、フレームが来るたびに 50 件ずつ足す
export const AddsBatchPerFrame = meta.story({
  args: { days: longSeries },
  parameters: { query: SEARCHING_SERIES, vrt: { skip: true } },
  beforeEach: holdFrames,
  play: async ({ canvas }) => {
    await expect(await canvas.findAllByRole('link')).toHaveLength(20);
    await settle();
    await expect(canvas.getAllByRole('link')).toHaveLength(20);

    advanceFrame();
    await waitFor(async () => {
      await expect(canvas.getAllByRole('link')).toHaveLength(70);
    });

    advanceFrame();
    await waitFor(async () => {
      await expect(canvas.getAllByRole('link')).toHaveLength(120);
    });
    await expect(canvas.getByText('連載 第120回')).toBeInTheDocument();
  },
});

// エッジケース: 描き終える前にフレームが続けて来ても、足すのは 1 回分の 50 件だけ
export const AddsOneBatchUntilRendered = meta.story({
  args: { days: longSeries },
  parameters: { query: SEARCHING_SERIES, vrt: { skip: true } },
  beforeEach: holdFrames,
  play: async ({ canvas }) => {
    await expect(await canvas.findAllByRole('link')).toHaveLength(20);

    advanceFrame();
    advanceFrame();
    advanceFrame();
    await waitFor(async () => {
      await expect(canvas.getAllByRole('link')).toHaveLength(70);
    });
    await settle();
    await expect(canvas.getAllByRole('link')).toHaveLength(70);
  },
});

// 正常系: 戻る・進むで開いたときは、router が前の位置へ戻す前に全件を描いておく
export const ShowsAllOnTraverse = meta.story({
  args: { days: series },
  parameters: { query: SEARCHING_SERIES, vrt: { skip: true } },
  beforeEach: () => {
    // <Router> は表に無い pathname では何も描かないので、一覧の pathname で始める
    history.replaceState(
      history.state,
      '',
      `${READING_LIST_PATHNAME}${location.search}`,
    );
    return holdFrames();
  },
  decorators: [
    (Story: FC) => (
      <UnderRouter>
        <Story />
      </UnderRouter>
    ),
  ],
  play: async ({ canvas }) => {
    await expect(await canvas.findAllByRole('link')).toHaveLength(20);
    await navigation.navigate('/elsewhere').finished;
    await expect(await canvas.findByText('別のページ')).toBeInTheDocument();

    await navigation.back().finished;

    await expect(canvas.getAllByRole('link')).toHaveLength(30);
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
