import { expect, spyOn, waitFor, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { mountStoryUrl } from '../../../../.storybook/url-state-story';
import type {
  ReadingArticle,
  ReadingDay,
} from '../reading-list-source/reading-list-source';
import { ReadingDigestList } from './reading-digest-list';

const gptLive: ReadingArticle = {
  id: 4,
  title: 'GPT-Live 1.1 now available on AI Gateway',
  url: 'https://vercel.com/changelog/gpt-live',
  publishedAt: '2026-11-19T05:00:00.000Z',
  imageUrl: null,
  summary:
    'OpenAIの全二重音声モデル「GPT-Live 1.1」がAI Gatewayで利用可能になりました。話しながら同時に聞き取れるため、通話相手は返答の途中で間を置いたり、割り込んだり、補足を加えたりできます。',
  description: null,
  sourceTitle: 'Vercel',
};

const liquid: ReadingArticle = {
  id: 3,
  title: 'Liquid AI d1.2 is now available on AI Gateway',
  url: 'https://vercel.com/changelog/liquid',
  publishedAt: '2026-11-19T04:00:00.000Z',
  imageUrl: null,
  summary: null,
  description: 'You can now access Liquid AI d1.2 through AI Gateway.',
  sourceTitle: 'Vercel',
};

const scrollState: ReadingArticle = {
  id: 2,
  title: 'scroll-state()',
  url: 'https://css-tricks.com/scroll-state',
  publishedAt: '2026-11-19T02:00:00.000Z',
  imageUrl: null,
  summary: null,
  description: null,
  sourceTitle: 'CSS-Tricks',
};

const spatial: ReadingArticle = {
  id: 1,
  title: 'Introducing spatial CSS',
  url: 'https://css-tricks.com/spatial',
  publishedAt: '2026-11-17T02:00:00.000Z',
  imageUrl: null,
  summary: null,
  description: null,
  sourceTitle: 'CSS-Tricks',
};

const days: ReadingDay[] = [
  {
    date: '2026-11-19',
    articleCount: 3,
    overview:
      'CSS の解説が1件と、Vercel のモデル追加が2件。大きな発表は無く、小さな更新が中心の日です。',
    picks: [
      {
        article: scrollState,
        reason:
          'スクロールの状態を CSS だけで問い合わせられる。JavaScript の監視を置き換えられる。',
      },
    ],
    topics: [
      {
        kind: 'release',
        headline: 'AI Gateway に新しいモデルが2つ加わった',
        articles: [gptLive, liquid],
      },
    ],
    remainingArticles: [],
  },
  {
    date: '2026-11-17',
    articleCount: 1,
    overview: null,
    picks: [],
    topics: [],
    remainingArticles: [spatial],
  },
];

const meta = preview.meta({
  title: 'app/reading-list/reading-digest-list',
  component: ReadingDigestList,
  args: { days },
  beforeEach: mountStoryUrl,
});

const dayOf = (canvasElement: HTMLElement, name: RegExp): HTMLElement => {
  const day = within(canvasElement)
    .getByRole('heading', { name })
    .closest('section');
  if (day === null) {
    throw new Error(`${String(name)} の区画がありません`);
  }
  return day;
};

// 1 日は、全体像・注目の記事・話題の順に並ぶ。注目の記事は畳まない
export const Primary = meta.story({
  play: async ({ canvasElement }) => {
    const day = dayOf(canvasElement, /11月19日\(木\)/u);
    await expect(
      within(day).getByText(/大きな発表は無く、小さな更新が中心の日です。/u),
    ).toBeVisible();
    await expect(
      within(day).getByRole('heading', { name: '注目の記事' }),
    ).toBeVisible();
    await expect(
      within(day).getByRole('link', {
        name: 'scroll-state() （新しいタブで開く）',
      }),
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

// 記事の行は、題の外（理由・出どころ）を押しても元の記事へのリンクに当たる
export const LinksWholeRow = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', {
      name: 'scroll-state() （新しいタブで開く）',
    });
    for (const text of [
      canvas.getByText(/JavaScript の監視を置き換えられる。/u),
      canvas.getByText('CSS-Tricks'),
    ]) {
      const { left, top, width, height } = text.getBoundingClientRect();
      await expect(
        document.elementFromPoint(left + width / 2, top + height / 2),
      ).toBe(link);
    }
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
        name: 'GPT-Live 1.1 now available on AI Gateway （新しいタブで開く）',
      }),
    ).toHaveAttribute('href', 'https://vercel.com/changelog/gpt-live');
    await expect(
      canvas.getByRole('link', {
        name: 'Liquid AI d1.2 is now available on AI Gateway （新しいタブで開く）',
      }),
    ).toBeVisible();
    await expect(canvas.getByText(/OpenAIの全二重音声モデル/u)).toBeVisible();
    await expect(
      canvas.getByText('You can now access Liquid AI d1.2 through AI Gateway.'),
    ).toBeVisible();

    await userEvent.click(topic);

    await expect(
      canvas.queryByRole('link', {
        name: 'GPT-Live 1.1 now available on AI Gateway （新しいタブで開く）',
      }),
    ).toBeNull();
  },
});

// まとめをまだ作っていない日は、全体像も注目の記事も出さず、その日の記事をまとめた 1 行にする
export const DayWithoutDigest = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvasElement, userEvent }) => {
    const day = dayOf(canvasElement, /11月17日\(火\)/u);
    await expect(
      within(day).queryByRole('heading', { name: '注目の記事' }),
    ).toBeNull();
    const topic = within(day).getByRole('button', {
      name: 'この日の記事 CSS-Tricks・1件',
    });

    await userEvent.click(topic);

    await expect(
      within(day).getByRole('link', {
        name: 'Introducing spatial CSS （新しいタブで開く）',
      }),
    ).toBeVisible();
  },
});

// 一覧が移った先の要素
let scrolledTo: Element[] = [];

// URL の fragment が日付を指していれば、描いたあとにその日へ移る（RSS の項目のリンク）
export const ScrollsToFragmentDay = meta.story({
  parameters: { hash: '#2026-11-17', vrt: { skip: true } },
  beforeEach: () => {
    scrolledTo = [];
    const scroll = spyOn(
      Element.prototype,
      'scrollIntoView',
    ).mockImplementation(function record(this: Element) {
      scrolledTo.push(this);
    });
    return () => {
      scroll.mockRestore();
    };
  },
  play: async ({ canvasElement }) => {
    const day = dayOf(canvasElement, /11月17日\(火\)/u);

    await expect(day).toHaveAttribute('id', '2026-11-17');
    await waitFor(async () => {
      await expect(scrolledTo).toStrictEqual([day]);
    });
  },
});
