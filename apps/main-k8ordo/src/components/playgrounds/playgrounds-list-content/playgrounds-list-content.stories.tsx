import { expect, userEvent, waitFor } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { PlaygroundsListContent } from './playgrounds-list-content';
import type { PlaygroundSummary } from './types';

const playgrounds: PlaygroundSummary[] = [
  {
    id: 'container-style-queries',
    title: 'Container style queries',
    description: '親のカスタムプロパティでスタイルを切り替える仕組みです。',
    category: 'css',
    demoCount: 1,
    demoTexts: ['テーマ切り替え', '親のテーマに追従するカード'],
    hasBlog: true,
  },
  {
    id: 'scope',
    title: '@scope',
    description: 'CSS スタイルの適用範囲を特定の DOM 部分木に限定します。',
    category: 'css',
    demoCount: 3,
    demoTexts: ['ドーナツスコープ', 'スコープの近接性'],
    hasBlog: true,
  },
  {
    id: 'popover',
    title: 'Popover API',
    description:
      'JavaScript なしでツールチップやドロップダウンを実装できます。',
    category: 'html',
    demoCount: 2,
    demoTexts: ['基本的なポップオーバー'],
    hasBlog: true,
  },
  {
    id: 'view-transitions',
    title: 'View Transition API',
    description: 'DOM の更新にアニメーションを適用する API です。',
    category: 'js-api',
    demoCount: 1,
    demoTexts: ['View Transition基本デモ'],
    hasBlog: false,
  },
];

const SEARCH_LABEL = 'Playgroundを検索';

const queryInUrl = (): string | null =>
  new URL(location.href).searchParams.get('q');

// q を URLSearchParams で書き直すと %20 が + になるので、渡された綴りのまま足す
const replaceQuery = (query: string): void => {
  const url = new URL(location.href);
  url.searchParams.delete('q');
  url.search = [url.search.slice(1), query].filter(Boolean).join('&');
  history.replaceState(history.state, '', url);
};

const meta = preview.meta({
  title: 'app/playgrounds/playgrounds-list-content',
  component: PlaygroundsListContent,
  args: { playgrounds },
  // Storybook には Navigation API を拾う router が無く、q を書く navigate がそのままでは iframe を
  // 読み込み直すので、同じ文書の navigate を止める。Story は同じページで続けて走るので、URL の q は
  // Story の前後で parameters.query（無ければ無し）に戻す
  beforeEach: ({ parameters }) => {
    replaceQuery(
      typeof parameters['query'] === 'string' ? parameters['query'] : '',
    );
    const intercept = (event: NavigateEvent): void => {
      if (
        event.canIntercept &&
        new URL(event.destination.url).pathname === location.pathname
      ) {
        event.intercept();
      }
    };
    navigation.addEventListener('navigate', intercept);
    return () => {
      navigation.removeEventListener('navigate', intercept);
      replaceQuery('');
    };
  },
});

export const Primary = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByText('4件のPlayground')).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'CSS' }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole('link')).toHaveLength(4);
  },
});

export const FilterWhileTyping = meta.story({
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: SEARCH_LABEL });
    const entries = navigation.entries().length;

    for (const typed of ['s', 'sc', 'sco', 'scop', 'scope']) {
      await userEvent.type(input, typed.slice(-1));
      await expect(input).toHaveValue(typed);
      // waitFor で待つと、遅らせて書く形が待つ「打たない間」をこちらが作ってしまうので、待たずに読む
      await expect(queryInUrl()).toBe(typed);
    }

    await expect(navigation.entries()).toHaveLength(entries);
    await waitFor(() =>
      expect(canvas.getByText('1件のPlayground')).toBeInTheDocument(),
    );
    await expect(
      canvas.getByRole('link', { name: /@scope/u }),
    ).toBeInTheDocument();
  },
});

export const ClearRemovesQuery = meta.story({
  parameters: { query: 'q=popover' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: SEARCH_LABEL });
    await expect(input).toHaveValue('popover');

    await userEvent.clear(input);

    await waitFor(() => expect(queryInUrl()).toBeNull());
    await waitFor(() =>
      expect(canvas.getByText('4件のPlayground')).toBeInTheDocument(),
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
        canvas.getByText('条件に一致するPlaygroundがありません'),
      ).toBeInTheDocument(),
    );
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
  },
});

export const FollowsHistory = meta.story({
  parameters: { query: 'q=scope' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: SEARCH_LABEL });
    const next = new URL(location.href);
    next.searchParams.set('q', 'popover');

    await navigation.navigate(next.href, { history: 'push' }).finished;
    await waitFor(() => expect(input).toHaveValue('popover'));

    await navigation.back().finished;
    await waitFor(() => expect(input).toHaveValue('scope'));
    await waitFor(() =>
      expect(canvas.getByText('1件のPlayground')).toBeInTheDocument(),
    );
  },
});

export const OpenWithPlusInQuery = meta.story({
  parameters: { query: 'q=view+transition' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: SEARCH_LABEL }),
    ).toHaveValue('view transition');
    await waitFor(() =>
      expect(canvas.getByText('1件のPlayground')).toBeInTheDocument(),
    );
  },
});

export const OpenWithPercentEncodedSpaceInQuery = meta.story({
  parameters: { query: 'q=view%20transition' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: SEARCH_LABEL }),
    ).toHaveValue('view transition');
    await waitFor(() =>
      expect(canvas.getByText('1件のPlayground')).toBeInTheDocument(),
    );
  },
});
