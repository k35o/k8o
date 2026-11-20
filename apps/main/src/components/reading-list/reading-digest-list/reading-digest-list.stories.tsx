import { expect, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import type { ReadingList } from '../reading-list-source/reading-list-source';
import { ReadingDigestList } from './reading-digest-list';

const vercel = { id: 1, title: 'Vercel', siteUrl: 'https://vercel.com/blog' };
const cssTricks = {
  id: 2,
  title: 'CSS-Tricks',
  siteUrl: 'https://css-tricks.com',
};

const articles: ReadingList['articles'] = [
  {
    id: 4,
    title: 'GPT-Live 1.1 now available on AI Gateway',
    url: 'https://vercel.com/changelog/gpt-live',
    publishedAt: '2026-11-19T05:00:00.000Z',
    imageUrl: null,
    description: null,
    summary:
      'OpenAIの全二重音声モデル「GPT-Live 1.1」がAI Gatewayで利用可能になりました。話しながら同時に聞き取れるため、通話相手は返答の途中で間を置いたり、割り込んだり、補足を加えたりできます。',
    source: vercel,
  },
  {
    id: 3,
    title: 'Liquid AI d1.2 is now available on AI Gateway',
    url: 'https://vercel.com/changelog/liquid',
    publishedAt: '2026-11-19T04:00:00.000Z',
    imageUrl: null,
    description: 'Liquid AI の決定モデルが使えるようになった。',
    summary: null,
    source: vercel,
  },
  {
    id: 2,
    title: 'scroll-state()',
    url: 'https://css-tricks.com/scroll-state',
    publishedAt: '2026-11-19T02:00:00.000Z',
    imageUrl: null,
    description: null,
    summary: null,
    source: cssTricks,
  },
  {
    id: 1,
    title: 'Introducing spatial CSS',
    url: 'https://css-tricks.com/spatial',
    publishedAt: '2026-11-17T02:00:00.000Z',
    imageUrl: null,
    description: null,
    summary: null,
    source: cssTricks,
  },
];

const digests: ReadingList['digests'] = [
  {
    date: '2026-11-19',
    overview:
      'CSS の解説が1件と、Vercel のモデル追加が2件。大きな発表は無く、小さな更新が中心の日です。',
    picks: [
      {
        articleId: 2,
        reason:
          'スクロールの状態を CSS だけで問い合わせられる。JavaScript の監視を置き換えられる。',
      },
    ],
    topics: [
      {
        kind: 'release',
        headline: 'AI Gateway に新しいモデルが2つ加わった',
        articleIds: [4, 3],
      },
    ],
  },
];

const meta = preview.meta({
  title: 'app/reading-list/reading-digest-list',
  component: ReadingDigestList,
  args: { articles, digests },
});

// 1 日は、全体像・見てほしい記事・残りの話題の順に並ぶ。見てほしい記事は畳まない
export const Primary = meta.story({
  play: async ({ canvas }) => {
    const day = canvas
      .getByRole('heading', { name: /11月19日\(木\)/u })
      .closest('section');
    if (day === null) {
      throw new Error('11月19日の区画がありません');
    }
    await expect(
      within(day).getByText(/大きな発表は無く、小さな更新が中心の日です。/u),
    ).toBeVisible();
    await expect(
      within(day).getByRole('heading', { name: '見てほしい' }),
    ).toBeVisible();
    await expect(
      within(day).getByRole('link', { name: 'scroll-state()' }),
    ).toHaveAttribute('href', 'https://css-tricks.com/scroll-state');
    await expect(
      within(day).getByText(/JavaScript の監視を置き換えられる。/u),
    ).toBeVisible();
    await expect(
      within(day).getByRole('button', {
        name: 'リリース AI Gateway に新しいモデルが2つ加わった Vercel・2件',
      }),
    ).toHaveAttribute('aria-expanded', 'false');
    await expect(within(day).getAllByRole('link')).toHaveLength(1);
  },
});

// 話題を押すと、その話題の記事だけが開く。もう一度押すと閉じる
export const OpensTopic = meta.story({
  play: async ({ canvas, userEvent }) => {
    const topic = canvas.getByRole('button', {
      name: /AI Gateway に新しいモデルが2つ加わった/u,
    });

    await userEvent.click(topic);

    await expect(topic).toHaveAttribute('aria-expanded', 'true');
    await expect(
      canvas.getByRole('link', {
        name: 'GPT-Live 1.1 now available on AI Gateway',
      }),
    ).toHaveAttribute('href', 'https://vercel.com/changelog/gpt-live');
    await expect(
      canvas.getByRole('link', {
        name: 'Liquid AI d1.2 is now available on AI Gateway',
      }),
    ).toBeVisible();
    await expect(canvas.getByText(/OpenAIの全二重音声モデル/u)).toBeVisible();
    await expect(
      canvas.getByText('Liquid AI の決定モデルが使えるようになった。'),
    ).toBeVisible();

    await userEvent.click(topic);

    await expect(
      canvas.queryByRole('link', {
        name: 'GPT-Live 1.1 now available on AI Gateway',
      }),
    ).toBeNull();
  },
});

// まとめをまだ作っていない日は、全体像も見てほしい記事も出さず、その日の記事をまとめた 1 行にする
export const DayWithoutDigest = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas, userEvent }) => {
    const day = canvas
      .getByRole('heading', { name: /11月17日\(火\)/u })
      .closest('section');
    if (day === null) {
      throw new Error('11月17日の区画がありません');
    }
    await expect(
      within(day).queryByRole('heading', { name: '見てほしい' }),
    ).toBeNull();
    const topic = within(day).getByRole('button', {
      name: 'この日の記事 CSS-Tricks・1件',
    });

    await userEvent.click(topic);

    await expect(
      within(day).getByRole('link', { name: 'Introducing spatial CSS' }),
    ).toBeVisible();
  },
});
