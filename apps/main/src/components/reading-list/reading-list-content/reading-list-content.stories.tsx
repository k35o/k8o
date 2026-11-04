import { ListIcon } from '@k8ordo/ui';
import { HttpResponse, http } from 'msw/http';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import type { ReadingList } from '@/features/reading-list/interface/queries';

import preview from '../../../../.storybook/preview';
import {
  interceptUrlNavigation,
  paramInUrl,
} from '../../../../.storybook/url-state-story';
import { ReadingListContent } from './reading-list-content';

const READING_LIST_URL = 'https://api.k8o.me/public/reading-list';

const zenn = { id: 1, title: 'Zenn', siteUrl: 'https://zenn.dev' };
const webDev = { id: 2, title: 'web.dev', siteUrl: 'https://web.dev' };

const buildTime: ReadingList = {
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

// ビルドのあと、api の同期で web.dev の記事が1件増えた
const latest: ReadingList = {
  articles: [
    {
      id: 3,
      title: 'View Transitions の新しい API',
      url: 'https://web.dev/articles/view-transitions-update',
      publishedAt: '2026-10-22T00:00:00.000Z',
      imageUrl: null,
      description: null,
      summary: 'View Transitions に加わった API を紹介する記事。',
      source: webDev,
    },
    ...buildTime.articles,
  ],
  sources: buildTime.sources,
};

// 初めの描画で先頭だけを描く件数より多い
const series: ReadingList = {
  articles: Array.from({ length: 30 }, (_, index) => ({
    id: 100 + index,
    title: `連載 第${String(index + 1)}回`,
    url: `https://zenn.dev/example/articles/series-${String(index + 1)}`,
    publishedAt: new Date(Date.UTC(2026, 9, 30 - index)).toISOString(),
    imageUrl: null,
    description: null,
    summary: null,
    source: zenn,
  })),
  sources: buildTime.sources,
};

const requested = fn();

const meta = preview.meta({
  title: 'app/reading-list/reading-list-content',
  component: ReadingListContent,
  args: { readingList: buildTime, filterIcon: <ListIcon /> },
  beforeEach: (context) => {
    requested.mockClear();
    return interceptUrlNavigation(context);
  },
});

export const Replaced = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.get(READING_LIST_URL, () => HttpResponse.json(latest)));
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('View Transitions の新しい API'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('3件の記事')).toBeInTheDocument();
  },
});

export const KeepsBuildTimeOnFailure = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(
      http.get(READING_LIST_URL, () => {
        requested();
        return HttpResponse.json(
          { ok: false, error: 'internal_error' },
          { status: 500 },
        );
      }),
    );
  },
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(requested).toHaveBeenCalledOnce();
    });
    await expect(canvas.getByText('2件の記事')).toBeInTheDocument();
    await expect(
      canvas.getByText('TanStack Routerで型安全なルーティング'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('View Transitions の新しい API'),
    ).not.toBeInTheDocument();
  },
});

// ソースごとの件数と絞り込みも、差し替えた記事で数える
export const FiltersReplacedArticles = meta.story({
  beforeEach: ({ msw }) => {
    msw.use(http.get(READING_LIST_URL, () => HttpResponse.json(latest)));
  },
  play: async ({ canvas }) => {
    await canvas.findByText('3件の記事');

    await userEvent.click(canvas.getByRole('button', { name: '絞り込み' }));
    const combobox = await screen.findByRole('combobox', { name: 'ソース' });
    await userEvent.click(combobox);
    await userEvent.type(combobox, 'web.dev');
    await userEvent.click(
      await screen.findByRole('option', { name: 'web.dev (2)' }),
    );

    await expect(
      canvas.getByText('2件の記事 / 1件のソースで絞り込み中'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('TanStack Routerで型安全なルーティング'),
    ).not.toBeInTheDocument();
  },
});

export const RendersAllArticles = meta.story({
  args: { readingList: series },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText('連載 第30回')).toBeInTheDocument();
    await expect(canvas.getAllByRole('link')).toHaveLength(30);
    await expect(canvas.getByText('30件の記事')).toBeInTheDocument();
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

export const WriteFiltersToUrl = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const entries = navigation.entries().length;

    await userEvent.click(canvas.getByRole('button', { name: '絞り込み' }));
    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: '並び順' }),
      'oldest',
    );
    await expect(paramInUrl('sort')).toBe('oldest');
    await userEvent.type(screen.getByRole('textbox', { name: '検索' }), 'ba');
    await expect(paramInUrl('q')).toBe('ba');

    const sources = screen.getByRole('combobox', { name: 'ソース' });
    await userEvent.click(sources);
    await userEvent.click(
      await screen.findByRole('option', { name: 'web.dev (1)' }),
    );
    await expect(paramInUrl('source')).toBe('2');
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
