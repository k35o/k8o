import { Router, defineRoutes } from '@k8ordo/router';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import { expect, spyOn, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { mountStoryUrl } from '../../../../.storybook/url-state-story';
import type { ReadingArticle } from '../reading-list-source/reading-list-source';
import { ReadingSearchResults } from './reading-search-results';

const seriesOf = (length: number): ReadingArticle[] =>
  Array.from({ length }, (_, index) => ({
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
  }));

// 初めの描画で先頭だけを描く件数より多い
const series = seriesOf(30);

// 先頭の 20 件のあと、50 件ずつ 2 回足して描き終える
const longSeries = seriesOf(120);

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

const RESULTS_PATHNAME = '/reading-list';

const Elsewhere: FC = () => <p>別のページ</p>;

// 戻る・進むの位置を戻すのは router なので、<Router> の下で結果を開き直す
const UnderRouter: FC<{ children: ReactNode }> = ({ children }) => {
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [routes] = useState(() =>
    defineRoutes({
      [RESULTS_PATHNAME]: () => children,
      '/elsewhere': Elsewhere,
    }),
  );
  return <Router routes={routes} />;
};

const meta = preview.meta({
  title: 'app/reading-list/reading-search-results',
  component: ReadingSearchResults,
  args: { articles: series },
  beforeEach: mountStoryUrl,
});

// 正常系: 記事の行に公開日を添えて並べる
export const RendersAllResults = meta.story({
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('連載 第30回')).toBeInTheDocument();
    await expect(canvas.getAllByRole('link')).toHaveLength(30);
    await expect(canvas.getAllByText('Zenn・2026年10月30日')).toHaveLength(30);
  },
});

// 正常系: 初めは先頭の 20 件だけを描き、フレームが来るたびに 50 件ずつ足す
export const AddsBatchPerFrame = meta.story({
  args: { articles: longSeries },
  parameters: { vrt: { skip: true } },
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
  args: { articles: longSeries },
  parameters: { vrt: { skip: true } },
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
  parameters: { vrt: { skip: true } },
  beforeEach: () => {
    // <Router> は表に無い pathname では何も描かないので、結果の pathname で始める
    history.replaceState(
      history.state,
      '',
      `${RESULTS_PATHNAME}${location.search}`,
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
