import { expect, spyOn, userEvent } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { DeckViewer } from './deck-viewer';

const meta = preview.meta({
  title: 'app/slides/slide-deck/deck-viewer',
  component: DeckViewer,
  args: {
    slug: 'sample-deck',
    title: 'サンプルスライド',
    qrUrl: 'https://k8o.me/slides/sample-deck',
    slides: [
      { content: [<h1 key="cover">k8o のスライド機能</h1>], notes: [] },
      { content: [<h2 key="intro">スライド機能のご紹介</h2>], notes: [] },
      { content: [<h2 key="end">まとめ</h2>], notes: [] },
    ],
  },
  parameters: { vrt: { skip: true } },
  // ページ送りは URL の hash を書くので、Story のあとに戻す
  beforeEach: () => {
    const url = location.href;
    return () => {
      history.replaceState(null, '', url);
    };
  },
});

// storage を塞いだブラウザは、window.sessionStorage を読むだけで投げる
const denySessionStorage = (): void => {
  spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
    throw new DOMException('denied', 'SecurityError');
  });
};

// 容量を使い切った sessionStorage は、読めても書くと投げる
const fillSessionStorage = (): void => {
  spyOn(window, 'sessionStorage', 'get').mockReturnValue({
    length: 0,
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    removeItem: () => undefined,
    setItem: () => {
      throw new DOMException('full', 'QuotaExceededError');
    },
  });
};

export const NavigateWithoutSessionStorage = meta.story({
  beforeEach: denySessionStorage,
  play: async ({ canvas }) => {
    await canvas.findByRole('heading', {
      level: 1,
      name: 'k8o のスライド機能',
    });

    await userEvent.keyboard('{ArrowRight}');

    await expect(
      await canvas.findByRole('heading', { name: 'スライド機能のご紹介' }),
    ).toBeInTheDocument();
    await expect(location.hash).toBe('#2');
  },
});

export const NavigateWhenSessionStorageIsFull = meta.story({
  beforeEach: fillSessionStorage,
  play: async ({ canvas }) => {
    await canvas.findByRole('heading', {
      level: 1,
      name: 'k8o のスライド機能',
    });

    await userEvent.keyboard('{ArrowRight}');

    await expect(location.hash).toBe('#2');
  },
});

export const OpenPresenterTabWithoutSessionStorage = meta.story({
  beforeEach: () => {
    denySessionStorage();
    const Native = BroadcastChannel;
    spyOn(globalThis, 'BroadcastChannel').mockImplementation(
      (name: string) => new Native(name),
    );
  },
  play: async ({ canvas }) => {
    const open = spyOn(window, 'open').mockReturnValue(null);
    await canvas.findByRole('heading', {
      level: 1,
      name: 'k8o のスライド機能',
    });

    await userEvent.click(canvas.getByRole('button', { name: '発表者モード' }));

    const [presenterHref] = open.mock.calls[0] ?? [];
    const session = new URL(
      String(presenterHref),
      location.origin,
    ).searchParams.get('session');
    await expect(session).toMatch(/^[\da-f-]{36}$/u);
    // 発表者のタブは URL の session の名前で観覧のタブの生存を聞く
    await expect(BroadcastChannel).toHaveBeenCalledWith(
      `slides-lifecycle:sample-deck:${session ?? ''}`,
    );
  },
});
