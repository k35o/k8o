import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { ToolFrame } from '../../../_components/tool-frame';
import { ChatSkeleton } from './chat-skeleton';

import styles from './chat-skeleton.stories.module.css';

const threadId = '6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01';

// Storybook の型は navigation に segments を持たないが、実行時は segments からルーターの木を組み、
// ToolFrame の useSelectedLayoutSegment がそれを読む。型の注釈を付けない定数にして渡す
const threadNavigation = {
  pathname: `/chat/${threadId}`,
  segments: ['chat', threadId],
};

const headerIn = (canvasElement: HTMLElement): HTMLElement => {
  const header = canvasElement.querySelector('header');
  if (header === null) {
    throw new Error('ヘッダーがありません');
  }
  return header;
};

const hasSkeleton = (element: HTMLElement): boolean =>
  element.querySelector('[data-skeleton]') !== null;

const meta = preview.meta({
  component: ChatSkeleton,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <ToolFrame sidebar={null}>
          <Story />
        </ToolFrame>
      </div>
    ),
  ],
  parameters: {
    nextjs: { navigation: threadNavigation },
  },
  args: { thread: null },
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 一覧で選ばずに開いた（再読み込みや戻る・進む）ときは、タイトルもモデルも骨組み
    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
    await expect(hasSkeleton(headerIn(canvasElement))).toBe(true);
    await expect(canvas.getByLabelText('読み込み中')).toBeInTheDocument();
  },
});

export const OpeningFromList = meta.story({
  args: {
    thread: {
      id: threadId,
      title: 'a11y の記事を教えて',
      model: 'claude-opus-5-5',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = headerIn(canvasElement);
    await expect(
      within(header).getByRole('heading', {
        level: 1,
        name: 'a11y の記事を教えて',
      }),
    ).toBeInTheDocument();
    await expect(within(header).getByText('Opus 5.5')).toBeInTheDocument();
    await expect(hasSkeleton(header)).toBe(false);
    // 会話の中身は、読み込むまで骨組み
    await expect(canvas.getByLabelText('読み込み中')).toBeInTheDocument();
  },
});

export const OpeningWithUnknownModel = meta.story({
  args: {
    thread: {
      id: threadId,
      title: 'a11y の記事を教えて',
      model: null,
    },
  },
  play: async ({ canvasElement }) => {
    const header = headerIn(canvasElement);
    await expect(
      within(header).getByRole('heading', {
        level: 1,
        name: 'a11y の記事を教えて',
      }),
    ).toBeInTheDocument();
    // モデルが分からないときは、モデルの欄だけを骨組みにする
    await expect(
      within(header).queryByText('Opus 5.5'),
    ).not.toBeInTheDocument();
    await expect(
      within(header).queryByText('Sonnet 5.5'),
    ).not.toBeInTheDocument();
    await expect(hasSkeleton(header)).toBe(true);
  },
});
