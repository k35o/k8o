import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

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
  'const greet = (name: string): string => `Hello, ${name}!`;',
  '```',
  '',
  '> 引用はこのように表示される。',
].join('\n');

const meta = {
  component: DeckPreview,
  // Stage は 16:9 をコンテナクエリで決めるため、枠の高さを固定して描画する。
  decorators: [
    (Story) => (
      <div style={{ height: '480px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DeckPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
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
};

export const Cover: Story = {
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
  },
};

export const WithNotes: Story = {
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
};

export const KeyboardNav: Story = {
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
};

export const Streaming: Story = {
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
};
