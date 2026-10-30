import { Router, defineRoutes } from '@k8ordo/router';
import { lazy, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { expect, spyOn, userEvent, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { interceptUrlNavigation } from '../../../../../.storybook/url-state-story';
import { H1, H2 } from '../../mdx-parts/heading/heading';
import { P } from '../../mdx-parts/paragraph/paragraph';
import { Cover } from '../../slide-mdx/cover/cover';
import { Notes } from '../../slide-mdx/notes/notes';
import { SlideDeckShell } from '../../slide-mdx/slide-deck-shell/slide-deck-shell';

const NOTE = 'これは2枚目のノート。発表者モードでのみ表示される。';

const meta = preview.meta({
  title: 'app/slides/slide-deck/slide-deck',
  component: SlideDeckShell,
  // MDX と同じく、hr で区切った子を並べて渡す
  args: {
    slug: 'sample-deck',
    title: 'サンプルスライド',
    children: [
      <Cover key="cover">
        <H1>k8o のスライド機能</H1>
        <H2>サンプルプレゼンテーション</H2>
      </Cover>,
      <hr key="hr-1" />,
      <H2 key="intro">スライド機能のご紹介</H2>,
      <P key="intro-body">
        k8o.meに追加されたスライド機能のサンプルデッキです。
      </P>,
      <Notes key="intro-notes">{NOTE}</Notes>,
      <hr key="hr-2" />,
      <H2 key="end">まとめ</H2>,
      <P key="end-body">ありがとうございました。</P>,
    ],
  },
  beforeEach: interceptUrlNavigation,
});

const counterOf = (canvasElement: HTMLElement): Element | null =>
  canvasElement.querySelector('[aria-live="polite"]');

const CHANNEL = 'slides:sample-deck';
const MARK = 'mark';

// 何も届かないことは待っても分からない。同じ文書の BroadcastChannel は送った順に届けるので、
// act のあとに別のチャンネルから送った印が届けば、act の中でデッキが送ったものも届いている
const sentDuring = async (act: () => Promise<void>): Promise<unknown[]> => {
  const listener = new BroadcastChannel(CHANNEL);
  const marker = new BroadcastChannel(CHANNEL);
  const received: unknown[] = [];
  const marked = new Promise<void>((resolve) => {
    listener.addEventListener('message', ({ data }: MessageEvent<unknown>) => {
      if (data === MARK) resolve();
      else received.push(data);
    });
  });
  await act();
  marker.postMessage(MARK);
  await marked;
  listener.close();
  marker.close();
  return received;
};

// 同じ文書の BroadcastChannel は作った順に届けるので、デッキより後に作った probe に届けば、
// デッキも受け終えている
const sendToDeck = async (message: unknown): Promise<void> => {
  const sender = new BroadcastChannel(CHANNEL);
  const probe = new BroadcastChannel(CHANNEL);
  const delivered = new Promise<void>((resolve) => {
    probe.addEventListener(
      'message',
      () => {
        resolve();
      },
      { once: true },
    );
  });
  sender.postMessage(message);
  await delivered;
  sender.close();
  probe.close();
};

const DECK_PATHNAME = '/slides/sample-deck';

// 着かない移る先。router は移る先の URL を先に書き、着くまでデッキを画面に残す
const Elsewhere = lazy(async () => new Promise<never>(() => undefined));

// router は画面のページを @k8ordo/state に知らせ、移るあいだもデッキは開いたときの URL の値で描かれる。
// Storybook には router が無く state が URL に従うので、移るあいだは <Router> の下でつくる
const UnderRouter: FC<{ children: ReactNode }> = ({ children }) => {
  // oxlint-disable-next-line react/hook-use-state -- 初期化時に一度だけ算出する安定値で setter は不要
  const [routes] = useState(() =>
    defineRoutes({ [DECK_PATHNAME]: () => children, '/elsewhere': Elsewhere }),
  );
  return <Router routes={routes} />;
};

const leaveDeck = async (): Promise<void> => {
  const { committed, finished } = navigation.navigate('/elsewhere');
  // 着かないので、Story のあとに URL を戻したときに中断される
  finished?.catch(() => undefined);
  await committed;
};

const leavePresenter = async (canvasElement: HTMLElement): Promise<void> => {
  const canvas = within(canvasElement);
  await canvas.findByRole('region', { name: '現在のスライド' });
  await leaveDeck();
};

const underRouter = {
  // <Router> は表に無い pathname では何も描かないので、デッキの pathname で始める
  beforeEach: () => {
    history.replaceState(
      history.state,
      '',
      `${DECK_PATHNAME}${location.search}${location.hash}`,
    );
  },
  decorators: [
    (Story: FC) => (
      <UnderRouter>
        <Story />
      </UnderRouter>
    ),
  ],
};

const presenterLeaving = {
  ...underRouter,
  parameters: {
    query: 'mode=presenter&session=story-session',
    hash: '#2',
    vrt: { skip: true },
  },
};

export const Viewer = meta.story({
  play: async ({ canvas, canvasElement }) => {
    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'k8o のスライド機能',
      }),
    ).toBeInTheDocument();
    const entries = navigation.entries().length;

    await userEvent.keyboard('{ArrowRight}');

    await expect(
      await canvas.findByRole('heading', { name: 'スライド機能のご紹介' }),
    ).toBeInTheDocument();
    await expect(location.hash).toBe('#2');
    await expect(counterOf(canvasElement)).toHaveTextContent('2 / 3');
    await expect(canvas.queryByText(NOTE)).not.toBeInTheDocument();
    // ページ送りは履歴を増やさない
    await expect(navigation.entries()).toHaveLength(entries);
  },
});

export const Presenter = meta.story({
  parameters: { query: 'mode=presenter&session=story-session', hash: '#2' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole('region', { name: '現在のスライド' }),
    ).toHaveTextContent('スライド機能のご紹介');
    await expect(
      canvas.getByRole('region', { name: '次のスライド' }),
    ).toHaveTextContent('まとめ');
    await expect(
      canvas.getByRole('region', { name: '発表者ノート' }),
    ).toHaveTextContent(NOTE);
  },
});

export const KeepUrlWhileLeaving = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'k8o のスライド機能',
      }),
    ).toBeInTheDocument();
    // router は移る先の URL を先に書き、着くまでデッキを残す。そのあいだを pathname だけ替えてまねる
    history.replaceState(history.state, '', `/slides${location.search}`);

    await userEvent.keyboard('{ArrowRight}');

    await expect(location.pathname).toBe('/slides');
    await expect(location.hash).toBe('');
    await expect(counterOf(canvasElement)).toHaveTextContent('1 / 3');
  },
});

export const PresenterKeepUrlWhileLeaving = meta.story({
  ...presenterLeaving,
  play: async ({ canvas, canvasElement }) => {
    await leavePresenter(canvasElement);

    const sent = await sentDuring(async () => {
      await userEvent.keyboard('{ArrowRight}');
    });

    await expect(location.pathname).toBe('/elsewhere');
    await expect(location.hash).toBe('');
    await expect(
      canvas.getByRole('region', { name: '現在のスライド' }),
    ).toHaveTextContent('スライド機能のご紹介');
    await expect(counterOf(canvasElement)).toHaveTextContent('2 / 3');
    // 観覧のタブを動かさない
    await expect(sent).toEqual([]);
  },
});

export const PresenterIgnoreSyncWhileLeaving = meta.story({
  ...presenterLeaving,
  play: async ({ canvas, canvasElement }) => {
    await leavePresenter(canvasElement);

    await sendToDeck({ type: 'sync', index: 2 });

    await expect(location.pathname).toBe('/elsewhere');
    await expect(location.hash).toBe('');
    await expect(
      canvas.getByRole('region', { name: '現在のスライド' }),
    ).toHaveTextContent('スライド機能のご紹介');
    await expect(counterOf(canvasElement)).toHaveTextContent('2 / 3');
  },
});

export const KeepSlideOnRedrawWhileLeaving = meta.story({
  ...underRouter,
  parameters: { hash: '#2', vrt: { skip: true } },
  play: async ({ canvas, canvasElement }) => {
    spyOn(window, 'open').mockReturnValue(window);
    await userEvent.click(
      await canvas.findByRole('button', { name: '発表者モード' }),
    );
    await expect(
      canvas.queryByRole('button', { name: '発表者モード' }),
    ).not.toBeInTheDocument();
    await leaveDeck();

    // 発表を終えると、移るあいだに描き直す
    await userEvent.keyboard('{Escape}');

    await expect(
      await canvas.findByRole('button', { name: '発表者モード' }),
    ).toBeInTheDocument();
    await expect(location.pathname).toBe('/elsewhere');
    await expect(counterOf(canvasElement)).toHaveTextContent('2 / 3');
    await expect(
      canvas.getByRole('heading', { name: 'スライド機能のご紹介' }),
    ).toBeInTheDocument();
  },
});

// 押したあとボタンにフォーカスが残り、Viewer の絵が変わるので分ける
export const OpenPresenterTab = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const open = spyOn(window, 'open').mockReturnValue(null);
    await canvas.findByRole('heading', {
      level: 1,
      name: 'k8o のスライド機能',
    });

    await userEvent.keyboard('{ArrowRight}');
    await userEvent.click(canvas.getByRole('button', { name: '発表者モード' }));

    const session = sessionStorage.getItem('slide-session:sample-deck');
    await expect(session).toMatch(/^[\da-f-]{36}$/u);
    await expect(open).toHaveBeenCalledWith(
      `/slides/sample-deck?mode=presenter&session=${session ?? ''}#2`,
      '_blank',
    );
  },
});

export const PresenterListensToSession = meta.story({
  parameters: {
    query: 'mode=presenter&session=story-session',
    hash: '#2',
    vrt: { skip: true },
  },
  // 素の spyOn は元の constructor を new なしで呼び、BroadcastChannel が作れないので、本物を包む
  beforeEach: () => {
    const Native = BroadcastChannel;
    spyOn(globalThis, 'BroadcastChannel').mockImplementation(
      (name: string) => new Native(name),
    );
  },
  play: async ({ canvas }) => {
    await canvas.findByRole('region', { name: '現在のスライド' });

    await expect(BroadcastChannel).toHaveBeenCalledWith(
      'slides-lifecycle:sample-deck:story-session',
    );
  },
});
