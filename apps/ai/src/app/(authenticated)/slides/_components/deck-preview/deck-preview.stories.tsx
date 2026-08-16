import type { HighlightedCode } from '@repo/code-highlight/tokenize';
import { useState } from 'react';
import type { FC } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { HighlightFn } from '@/app/_components/highlighted-code';
import { DeckHighlightContext } from '@/app/_components/slide-deck';

import preview from '../../../../../../.storybook/preview';
import { DeckPreview } from './deck-preview';

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
  },
});

export const WithNotes = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
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
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // フォーカスが body にある間は矢印キーでスライドが進む。
    await userEvent.keyboard('{ArrowRight}');
    await expect(
      await canvas.findByRole('heading', {
        level: 2,
        name: 'スライド機能のご紹介',
      }),
    ).toBeInTheDocument();
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
  (code: string): Promise<HighlightedCode | null> =>
    Promise.resolve({
      tokens: code
        .split('\n')
        .map((line, index) => [{ content: line, offset: index, color }]),
      fg: '#abb2bf',
      bg: '#282c34',
    });

const fakeHighlight = makeFakeHighlight('#e6edf3');

export const Highlighted = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
  },
  // ハイライト関数はスタジオが注入する構造なので、ストーリーでも同じ形で注入する。
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
    await waitFor(() => {
      const token = canvasElement.querySelector('pre code span');
      expect(token).not.toBeNull();
      expect(token).toHaveStyle({ color: '#e6edf3' });
    });
    // 印刷用ポータル（DeckPrint）にも同じハイライトが行き渡る。
    await waitFor(() => {
      expect(
        document.body.querySelector('[data-slide-print] pre code span'),
      ).not.toBeNull();
    });
  },
});

// テーマ切替でハイライト関数が差し替わる状況を、スタジオと同じ注入の形で再現する。
const SwitchableHighlight: FC<{ source: string }> = ({ source }) => {
  const [highlight, setHighlight] = useState<HighlightFn>(() =>
    makeFakeHighlight('#e6edf3'),
  );
  return (
    <div className="flex h-full flex-col">
      <button
        onClick={() => {
          setHighlight(() => makeFakeHighlight('#ffd7a0'));
        }}
        type="button"
      >
        テーマ切替
      </button>
      <div className="min-h-0 flex-1">
        <DeckHighlightContext value={highlight}>
          <DeckPreview isStreaming={false} source={source} />
        </DeckHighlightContext>
      </div>
    </div>
  );
};

// ハイライト関数が差し替わったら、同じデッキでも取得し直して配色が変わる。
export const RehighlightOnHighlighterChange = meta.story({
  args: {
    source: SAMPLE_DECK,
    isStreaming: false,
  },
  render: ({ source }) => <SwitchableHighlight source={source ?? ''} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await userEvent.click(canvas.getByRole('button', { name: '次のスライド' }));
    await waitFor(() => {
      expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: '#e6edf3',
      });
    });

    // userEvent.click は act でラップされる。act の中で更新が suspend すると
    // Promise 解決後の再開が流れず、実ブラウザでは通る切替がここだけ止まるため、
    // 切替の発火はネイティブの click で行う。
    canvas.getByRole('button', { name: 'テーマ切替' }).click();
    await waitFor(() => {
      expect(canvasElement.querySelector('pre code span')).toHaveStyle({
        color: '#ffd7a0',
      });
    });
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
