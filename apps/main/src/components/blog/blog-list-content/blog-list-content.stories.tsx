import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AppProvider } from '@/components/site/app-provider';

import preview from '../../../../.storybook/preview';
import {
  hydrateAfterTyping,
  interceptUrlNavigation,
  queryInUrl,
} from '../../../../.storybook/url-state-story';
import { BlogListContent } from './blog-list-content';
import type { BlogSummary } from './types';

const blogs: BlogSummary[] = [
  {
    id: 3,
    slug: 'container-queries',
    tags: ['CSS'],
    title: 'コンテナクエリでレイアウトを切り替える',
    description: '親の大きさに合わせて部品の見た目を変えます。',
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2025-03-10T00:00:00.000Z',
    readingTime: 5,
  },
  {
    id: 2,
    slug: 'react-hooks',
    tags: ['React', 'TypeScript'],
    title: 'React Hooks 入門',
    description: 'useState と useEffect を学ぶ',
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2024-06-20T00:00:00.000Z',
    readingTime: 8,
  },
  {
    id: 1,
    slug: 'css-grid',
    tags: ['CSS'],
    title: 'CSS Grid レイアウト',
    description: null,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
];

const SEARCH_LABEL = '記事を検索';

const meta = preview.meta({
  title: 'app/blog/blog-list-content',
  component: BlogListContent,
  args: { blogs },
  beforeEach: interceptUrlNavigation,
});

export const Primary = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByText('3件の記事')).toBeInTheDocument();
    await expect(
      canvas
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toStrictEqual(['2025年', '2024年']);
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
  },
});

export const FilterWhileTyping = meta.story({
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: SEARCH_LABEL });
    const entries = navigation.entries().length;

    for (const typed of ['h', 'ho', 'hoo', 'hook', 'hooks']) {
      await userEvent.type(input, typed.slice(-1));
      await expect(input).toHaveValue(typed);
      // waitFor で待つと、遅らせて書く形が待つ「打たない間」をこちらが作ってしまうので、待たずに読む
      await expect(queryInUrl()).toBe(typed);
    }

    await expect(navigation.entries()).toHaveLength(entries);
    await waitFor(() =>
      expect(canvas.getByText('1件の記事')).toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('link', { name: /React Hooks 入門/u }),
    ).toBeInTheDocument();
  },
});

export const FilterByTag = meta.story({
  play: async ({ canvas }) => {
    await userEvent.type(
      canvas.getByRole('textbox', { name: SEARCH_LABEL }),
      'typescript',
    );

    await waitFor(() =>
      expect(canvas.getByText('1件の記事')).toBeInTheDocument(),
    );
    await expect(
      canvas
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toStrictEqual(['2024年']);
    await expect(
      canvas.getByRole('link', { name: /React Hooks 入門/u }),
    ).toBeInTheDocument();
  },
});

export const ClearRemovesQuery = meta.story({
  parameters: { query: 'q=css' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: SEARCH_LABEL });
    await expect(input).toHaveValue('css');
    await waitFor(() =>
      expect(canvas.getByText('2件の記事')).toBeInTheDocument(),
    );

    await userEvent.clear(input);

    await waitFor(() => expect(queryInUrl()).toBeNull());
    await waitFor(() =>
      expect(canvas.getByText('3件の記事')).toBeInTheDocument(),
    );
  },
});

export const NoMatch = meta.story({
  play: async ({ canvas }) => {
    await userEvent.type(
      canvas.getByRole('textbox', { name: SEARCH_LABEL }),
      '存在しない',
    );

    await waitFor(() =>
      expect(
        canvas.getByText('条件に一致する記事がありません'),
      ).toBeInTheDocument(),
    );
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
  },
});

export const FollowsHistory = meta.story({
  parameters: { query: 'q=hooks' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: SEARCH_LABEL });
    const next = new URL(location.href);
    next.searchParams.set('q', 'css');

    await navigation.navigate(next.href, { history: 'push' }).finished;
    await waitFor(() => expect(input).toHaveValue('css'));
    await waitFor(() =>
      expect(canvas.getByText('2件の記事')).toBeInTheDocument(),
    );

    await navigation.back().finished;
    await waitFor(() => expect(input).toHaveValue('hooks'));
    await waitFor(() =>
      expect(canvas.getByText('1件の記事')).toBeInTheDocument(),
    );
  },
});

export const ReplayTypedBeforeHydration = meta.story({
  parameters: { vrt: { skip: true } },
  render: () => <div />,
  play: async ({ canvasElement }) => {
    const { host, dispose } = hydrateAfterTyping(
      canvasElement,
      <AppProvider>
        <BlogListContent blogs={blogs} />
      </AppProvider>,
      'css',
    );
    try {
      await waitFor(() => expect(queryInUrl()).toBe('css'));
      const view = within(host);
      await expect(
        view.getByRole('textbox', { name: SEARCH_LABEL }),
      ).toHaveValue('css');
      await waitFor(() =>
        expect(view.getByText('2件の記事')).toBeInTheDocument(),
      );
    } finally {
      dispose();
    }
  },
});

export const OpenWithPlusInQuery = meta.story({
  parameters: { query: 'q=react+hooks' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: SEARCH_LABEL }),
    ).toHaveValue('react hooks');
    await waitFor(() =>
      expect(canvas.getByText('1件の記事')).toBeInTheDocument(),
    );
  },
});

export const OpenWithPercentEncodedSpaceInQuery = meta.story({
  parameters: { query: 'q=react%20hooks' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: SEARCH_LABEL }),
    ).toHaveValue('react hooks');
    await waitFor(() =>
      expect(canvas.getByText('1件の記事')).toBeInTheDocument(),
    );
  },
});
