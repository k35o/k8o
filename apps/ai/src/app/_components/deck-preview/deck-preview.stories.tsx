import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { Activity, useCallback, useState } from 'react';
import type { ActivityProps, FC } from 'react';
import {
  expect,
  mocked,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { DeckHighlightContext } from '@/app/_components/slide-deck';

import preview from '../../../../.storybook/preview';
import { DeckPreview } from './deck-preview';

import styles from './deck-preview.stories.module.css';

const SAMPLE_DECK = [
  '<Cover>',
  '# k8o のスライド生成',
  '## AI で作るプレゼンテーション',
  '2026年7月 / k8o',
  '</Cover>',
  '',
  '---',
  '',
  '## スライド機能のご紹介',
  '',
  '- Markdown からスライドを生成する',
  '- **強調**や `インラインコード` も使える',
  '- 発表者ノートは画面に出ない',
  '',
  '<Notes>',
  'ここは発表者向けのメモ。',
  '</Notes>',
  '',
  '---',
  '',
  '## コードの見た目',
  '',
  '```ts',
  // oxlint-disable-next-line eslint/no-template-curly-in-string -- Markdown コードブロックの表示例で、テンプレートリテラルは意図的な文字列
  'const greet = (name: string): string => `Hello, ${name}!`;',
  '```',
  '',
  '> 引用はこのように表示される。',
].join('\n');

const hasPrintRule = (rules: CSSRuleList): boolean =>
  [...rules].some(
    (rule) =>
      rule instanceof CSSPageRule ||
      (rule instanceof CSSStyleRule &&
        rule.selectorText.includes('[data-slide-print]')) ||
      (rule instanceof CSSGroupingRule && hasPrintRule(rule.cssRules)),
  );

// 文書全体に効く印刷の規則（@page と、[data-slide-print] を指す body 直下の規則）を持つ <style> の
// media。片方だけ別のシートへ移っても、そのシートの media が混ざって落ちるよう、どちらの規則でも拾う。
// CSS のコメントに引っかからないよう、textContent ではなく解析された規則をたどる
const printRuleMedia = (): string[] =>
  [...document.querySelectorAll('style')]
    .filter(
      (style) => style.sheet !== null && hasPrintRule(style.sheet.cssRules),
    )
    .map((style) => style.media);

const meta = preview.meta({
  component: DeckPreview,
  // Stage は 16:9 をコンテナクエリで決めるため、枠の高さを固定して描画する。
  decorators: [
    (Story) => (
      <div style={{ height: '480px' }}>
        <Story />
      </div>
    ),
  ],
});

export const Empty = meta.story({
  args: {
    source: null,
    isStreaming: false,
    printable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/生成すると、ここにスライドのプレビュー/u),
    ).toBeInTheDocument();
  },
});

export const Cover = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'k8o のスライド生成' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('1')).toBeInTheDocument();
    await expect(canvas.getByText('/ 3')).toBeInTheDocument();
    // ノートの無いスライドでもノート欄は固定表示され、レイアウトシフトが起きない。
    await expect(
      canvas.getByText('このスライドにノートはありません'),
    ).toBeInTheDocument();
    // 印刷/PDF出力用に全スライドが body 直下へ描画されている（画面では非表示）。
    const printRoot = document.body.querySelector('[data-slide-print]');
    await expect(printRoot).not.toBeNull();
    await expect(printRoot?.children.length).toBe(3);
    // 表示しているあいだは、印刷の規則が印刷のときに効く。
    await expect(printRuleMedia()).toEqual(['print']);
  },
});

// ルートを移ったときの Activity と同じく、印刷用のスライドを描くデッキを隠したり外したりする。
const ActivityDeck: FC<{
  source: string;
  initialMode: NonNullable<ActivityProps['mode']>;
}> = ({ source, initialMode }) => {
  const [mode, setMode] = useState(initialMode);
  const [mounted, setMounted] = useState(true);
  return (
    <div className={styles.frame}>
      <button
        onClick={() => {
          setMode(mode === 'visible' ? 'hidden' : 'visible');
        }}
        type="button"
      >
        {mode === 'visible' ? '隠す' : '表示する'}
      </button>
      <button
        onClick={() => {
          setMounted(false);
        }}
        type="button"
      >
        外す
      </button>
      <div className={styles.body}>
        {mounted ? (
          <Activity mode={mode}>
            <DeckPreview isStreaming={false} printable source={source} />
          </Activity>
        ) : null}
      </div>
    </div>
  );
};

// Activity で隠れた画面の印刷用のスライドは body に残るが、印刷の規則は切れ、ほかの画面の印刷に
// 効かない。表示に戻ると効き直し、外すと規則ごと無くなる。
export const HiddenByActivity = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: true,
  },
  render: ({ source }) => (
    <ActivityDeck initialMode="visible" source={source ?? ''} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(printRuleMedia()).toEqual(['print']);
    });

    await userEvent.click(canvas.getByRole('button', { name: '隠す' }));
    await waitFor(async () => {
      await expect(printRuleMedia()).toEqual(['not all']);
    });
    await expect(
      document.body.querySelector('[data-slide-print]'),
    ).not.toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: '表示する' }));
    await waitFor(async () => {
      await expect(printRuleMedia()).toEqual(['print']);
    });

    await userEvent.click(canvas.getByRole('button', { name: '外す' }));
    await waitFor(async () => {
      await expect(printRuleMedia()).toEqual([]);
    });
  },
});

// hidden の Activity の中で先に描かれると、ref が付かないまま印刷用のスライドが body に入る。
// そのあいだも印刷の規則は効かず、表示したときに初めて効く。
export const MountedHidden = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: true,
  },
  render: ({ source }) => (
    <ActivityDeck initialMode="hidden" source={source ?? ''} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(
        document.body.querySelector('[data-slide-print]'),
      ).not.toBeNull();
    });
    await expect(printRuleMedia()).toEqual(['not all']);

    await userEvent.click(canvas.getByRole('button', { name: '表示する' }));
    await waitFor(async () => {
      await expect(printRuleMedia()).toEqual(['print']);
    });
  },
});

export const WithNotes = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    // IconButton の onAction は transition 内で非同期に反映されるため、リトライする find 系で待つ。
    await expect(
      await canvas.findByRole('heading', {
        level: 2,
        name: 'スライド機能のご紹介',
      }),
    ).toBeInTheDocument();
    // Notes は本文には出ず、ノート欄に出る。
    await expect(
      await canvas.findByText(/ここは発表者向けのメモ。/u),
    ).toBeInTheDocument();
  },
});

export const KeyboardNav = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cover = canvas.getByRole('heading', {
      level: 1,
      name: 'k8o のスライド生成',
    });
    // デッキの外（body）にフォーカスがある間は、同じ画面の会話のスクロールを奪わないよう進めない。
    await expect(document.activeElement).toBe(document.body);
    await userEvent.keyboard('{ArrowRight}');
    await expect(cover).toBeInTheDocument();
    // スライドを押すとデッキにフォーカスが入り、矢印キーで進む。
    await userEvent.click(cover);
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      await canvas.findByRole('heading', {
        level: 2,
        name: 'スライド機能のご紹介',
      }),
    ).toBeInTheDocument();
    // キーで操作すると、ブラウザ既定の枠ではなくデザインシステムのリングを内側に出す。
    const deck = document.activeElement;
    if (!(deck instanceof HTMLElement)) {
      throw new Error('デッキにフォーカスがありません');
    }
    await expect(getComputedStyle(deck).outlineStyle).toBe('none');
    await expect(getComputedStyle(deck).boxShadow).toContain('inset');
    // ノート欄（フォーカス可能なスクロール領域）にフォーカスがある間は、
    // デッキ操作にキーを奪わず既定動作（スクロール）に譲る。
    const notes = canvas.getByRole('region', { name: '発表者ノート' });
    notes.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'スライド機能のご紹介' }),
    ).toBeInTheDocument();
  },
});

// server action の代わりに使うフェイクのハイライト関数（1行=1トークンで色を付ける）。
// 色は a11y アドオンのコントラスト検査を満たす明るいものにする。
const makeFakeHighlight =
  (color: string): HighlightFn =>
  (blocks): Promise<Array<HighlightedCode | null>> =>
    Promise.resolve(
      blocks.map(({ code }) => ({
        tokens: code
          .split('\n')
          .map((line, index) => [{ content: line, offset: index, color }]),
        fg: '#abb2bf',
        bg: '#282c34',
      })),
    );

const fakeHighlight = makeFakeHighlight('#e6edf3');

export const Highlighted = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: true,
  },
  // ハイライト関数は画面（useDeckHighlight）が注入する構造なので、ストーリーでも同じ形で注入する。
  decorators: [
    (Story) => (
      <DeckHighlightContext value={fakeHighlight}>
        <Story />
      </DeckHighlightContext>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await expect(
      await canvas.findByRole('heading', { level: 2, name: 'コードの見た目' }),
    ).toBeInTheDocument();
    // デッキ単位で取得したハイライトがコードブロックに適用される（キー照合を含む検証）。
    await waitFor(async () => {
      const token = canvasElement.querySelector('pre code span');
      await expect(token).not.toBeNull();
      await expect(token).toHaveStyle({ color: '#e6edf3' });
    });
    // 印刷用ポータル（DeckPrint）にも同じハイライトが行き渡る。
    await waitFor(async () => {
      await expect(
        document.body.querySelector('[data-slide-print] pre code span'),
      ).not.toBeNull();
    });
  },
});

// テーマ切替でハイライト関数が差し替わる状況を、画面（useDeckHighlight）と同じ注入の形で再現する。
// 切り替えたあとの取得は「新しい配色を返す」を押すまで返さず、取得のあいだの表示を見られるようにする。
const SwitchableHighlight: FC<{ source: string }> = ({ source }) => {
  const [highlight, setHighlight] = useState<HighlightFn>(() =>
    makeFakeHighlight('#e6edf3'),
  );
  const [response, setResponse] =
    useState<PromiseWithResolvers<undefined> | null>(null);
  return (
    <div className={styles.frame}>
      <button
        onClick={() => {
          const pending = Promise.withResolvers<undefined>();
          setResponse(pending);
          setHighlight((): HighlightFn => async (blocks) => {
            await pending.promise;
            return makeFakeHighlight('#ffd7a0')(blocks);
          });
        }}
        type="button"
      >
        テーマ切替
      </button>
      <button
        disabled={response === null}
        onClick={() => {
          response?.resolve(undefined);
        }}
        type="button"
      >
        新しい配色を返す
      </button>
      <div className={styles.body}>
        <DeckHighlightContext value={highlight}>
          <DeckPreview isStreaming={false} printable={false} source={source} />
        </DeckHighlightContext>
      </div>
    </div>
  );
};

// ハイライト関数が差し替わったら、同じデッキでも取得し直して配色が変わる。取得のあいだは
// プレーンに戻さず、今の配色のままにする。
export const RehighlightOnHighlighterChange = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: false,
  },
  render: ({ source }) => <SwitchableHighlight source={source ?? ''} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await waitFor(async () => {
      await expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: '#e6edf3',
      });
    });

    await userEvent.click(canvas.getByRole('button', { name: 'テーマ切替' }));
    await expect(canvasElement.querySelector('pre code span')).toHaveStyle({
      color: '#e6edf3',
    });

    await userEvent.click(
      canvas.getByRole('button', { name: '新しい配色を返す' }),
    );
    await waitFor(async () => {
      await expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: '#ffd7a0',
      });
    });
  },
});

// Next の Server Action は、呼ばれたその場で App Router の state を更新する。同じ形の更新を
// 起こすフェイクを注入し、ハイライトの取得が描画の外で始まることを確かめる。
const ActionLikeHighlight: FC<{ source: string }> = ({ source }) => {
  const [requests, setRequests] = useState(0);
  const highlight = useCallback<HighlightFn>((blocks) => {
    setRequests((count) => count + 1);
    return fakeHighlight(blocks);
  }, []);
  return (
    <div className={styles.frame}>
      <p>ハイライトの要求: {requests}</p>
      <div className={styles.body}>
        <DeckHighlightContext value={highlight}>
          <DeckPreview isStreaming={false} printable={false} source={source} />
        </DeckHighlightContext>
      </div>
    </div>
  );
};

export const HighlightOutsideRender = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: false,
  },
  beforeEach: () => {
    spyOn(console, 'error');
  },
  render: ({ source }) => <ActionLikeHighlight source={source ?? ''} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('ハイライトの要求: 1'),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await waitFor(async () => {
      await expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: '#e6edf3',
      });
    });
    const updatesWhileRendering = mocked(console.error).mock.calls.filter(
      ([message]) =>
        String(message).includes('while rendering a different component'),
    );
    await expect(updatesWhileRendering).toEqual([]);
  },
});

export const Streaming = meta.story({
  args: {
    // 生成中の途中経過（末尾のスライドが書きかけ）。
    source: [
      SAMPLE_DECK,
      '',
      '---',
      '',
      '## 書きかけのスライド',
      '',
      '- 要点',
    ].join('\n'),
    isStreaming: true,
    printable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 生成中は末尾のスライドへ自動追従し、ナビゲーションは無効になる。
    await expect(
      canvas.getByRole('heading', { level: 2, name: '書きかけのスライド' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '前のスライド' }),
    ).toBeDisabled();
  },
});

export const NotPrintable = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
    printable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'k8o のスライド生成' }),
    ).toBeInTheDocument();
    // 会話のペインでは、印刷用の全スライドを body に描かない。
    await expect(document.body.querySelector('[data-slide-print]')).toBeNull();
    // 印刷の規則も入れず、会話の画面はふつうの用紙にそのまま印刷される。
    await expect(printRuleMedia()).toEqual([]);
  },
});

// system で禁じている画像をモデルが書いても、表紙にもふつうのスライドにも描かない。参照形式の画像と、
// スキームの無い URL も同じ
const IMAGE_DECK = [
  '<Cover>',
  '# 画像のあるデッキ',
  '',
  '![表紙の図](https://example.com/cover.png)',
  '</Cover>',
  '',
  '---',
  '',
  '## 構成',
  '',
  'サーバーとブラウザの役割を分ける。',
  '',
  '![図](https://example.com/a.png)',
  '',
  '![図][1]',
  '',
  '[1]: //example.com/b.png',
].join('\n');

export const WithoutImages = meta.story({
  args: {
    source: IMAGE_DECK,
    isStreaming: false,
    printable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: '画像のあるデッキ' }),
    ).toBeInTheDocument();
    await expect(canvasElement.querySelector('img')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await expect(
      await canvas.findByText('サーバーとブラウザの役割を分ける。'),
    ).toBeInTheDocument();
    await expect(canvasElement.querySelector('img')).toBeNull();
  },
});
