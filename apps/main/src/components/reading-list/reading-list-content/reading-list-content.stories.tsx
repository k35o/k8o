import { Router, defineRoutes } from '@k8ordo/router';
import { ListIcon } from '@k8ordo/ui/icons';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';
import {
  expect,
  screen,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import preview from '../../../../.storybook/preview';
import {
  expectParamInUrl,
  mountStoryUrl,
} from '../../../../.storybook/url-state-story';
import type { ReadingList } from '../reading-list-source/reading-list-source';
import { ReadingListContent } from './reading-list-content';

const zenn = { id: 1, title: 'Zenn', siteUrl: 'https://zenn.dev' };
const webDev = { id: 2, title: 'web.dev', siteUrl: 'https://web.dev' };

const readingList: ReadingList = {
  articles: [
    {
      id: 2,
      title: 'TanStack Routerで型安全なルーティング',
      url: 'https://zenn.dev/example/articles/tanstack-router',
      publishedAt: '2026-10-20T00:00:00.000Z',
      imageUrl: null,
      description: 'TanStack Routerの使い方を紹介します。',
      summary: null,
      source: zenn,
    },
    {
      id: 1,
      title: 'Baseline 2026 のふりかえり',
      url: 'https://web.dev/articles/baseline-2026',
      publishedAt: '2026-10-18T00:00:00.000Z',
      imageUrl: null,
      description: null,
      summary: '2026年に Baseline に入った機能をまとめた記事。',
      source: webDev,
    },
  ],
  sources: [
    { id: 1, title: 'Zenn' },
    { id: 2, title: 'web.dev' },
  ],
};

const seriesOf = (length: number): ReadingList => ({
  articles: Array.from({ length }, (_, index) => ({
    id: 100 + index,
    title: `連載 第${String(index + 1)}回`,
    url: `https://zenn.dev/example/articles/series-${String(index + 1)}`,
    publishedAt: new Date(Date.UTC(2026, 9, 30 - index)).toISOString(),
    imageUrl: null,
    description: null,
    summary: null,
    source: zenn,
  })),
  sources: readingList.sources,
});

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
  args: { readingList, filterIcon: <ListIcon /> },
  beforeEach: mountStoryUrl,
});

export const RendersAllArticles = meta.story({
  args: { readingList: series },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('連載 第30回')).toBeInTheDocument();
    await expect(canvas.getAllByRole('link')).toHaveLength(30);
    await expect(canvas.getByText('30件の記事')).toBeInTheDocument();
  },
});

// 正常系: 初めは先頭の 20 件だけを描き、フレームが来るたびに 50 件ずつ足す
export const AddsBatchPerFrame = meta.story({
  args: { readingList: longSeries },
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
  args: { readingList: longSeries },
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
  args: { readingList: series },
  parameters: { vrt: { skip: true } },
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
  args: { readingList: series },
  parameters: { query: 'q=第29回' },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('連載 第29回')).toBeInTheDocument();
    await expect(canvas.getByText('1件の記事')).toBeInTheDocument();
  },
});

export const OpenWithUrlValues = meta.story({
  parameters: { query: 'q=tanstack&source=1,abc,2&sort=oldest' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('1件の記事 / 2件のソースで絞り込み中'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('TanStack Routerで型安全なルーティング'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: '絞り込み' }));
    await expect(
      await screen.findByRole('textbox', { name: '検索' }),
    ).toHaveValue('tanstack');
    await expect(screen.getByRole('combobox', { name: '並び順' })).toHaveValue(
      'oldest',
    );
  },
});

// 正常系: ドロワーの見出しは Drawer の題の「絞り込み」1 つだけで、絞り込みの欄の見出しを重ねない
export const DrawerHeading = meta.story({
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '絞り込み' }));
    const drawer = await screen.findByRole('dialog', { name: '絞り込み' });

    await expect(
      within(drawer)
        .getAllByRole('heading')
        .map((heading) => heading.textContent),
    ).toStrictEqual(['絞り込み']);
  },
});

export const WriteFiltersToUrl = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const entries = navigation.entries().length;

    await userEvent.click(canvas.getByRole('button', { name: '絞り込み' }));
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: '並び順' }),
      'oldest',
    );
    await expectParamInUrl('sort', 'oldest');
    await userEvent.type(screen.getByRole('textbox', { name: '検索' }), 'ba');
    await expectParamInUrl('q', 'ba');

    const sources = screen.getByRole('combobox', { name: 'ソース' });
    await userEvent.click(sources);
    await userEvent.click(
      await screen.findByRole('option', { name: 'web.dev (1)' }),
    );
    await expectParamInUrl('source', '2');
    await expect(
      canvas.getByText('1件の記事 / 1件のソースで絞り込み中'),
    ).toBeInTheDocument();
    await expect(navigation.entries()).toHaveLength(entries);
  },
});

export const WriteOverOtherKeys = meta.story({
  parameters: {
    query: 'zz=1&sort=foo&source=1,abc&q=a&q=b',
    vrt: { skip: true },
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '絞り込み' }));
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: '並び順' }),
      'oldest',
    );
    await expect(location.search).toMatch(
      /[?&]zz=1&q=a&source=1%2Cabc&sort=oldest$/u,
    );
  },
});
