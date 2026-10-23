import { HttpResponse, http } from 'msw/http';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import type { ReadingList } from '@/features/reading-list/interface/queries';

import preview from '../../../../../.storybook/preview';
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

const requested = fn();

const meta = preview.meta({
  title: 'app/reading-list/reading-list-content',
  component: ReadingListContent,
  args: { readingList: buildTime },
  beforeEach: () => {
    requested.mockClear();
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
