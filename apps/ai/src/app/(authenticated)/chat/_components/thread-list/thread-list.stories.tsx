import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import type { ThreadListItem } from '@/features/agent/application/threads';

import preview from '../../../../../../.storybook/preview';
import { ThreadList } from './thread-list';

import styles from './thread-list.stories.module.css';

const threads: ThreadListItem[] = [
  {
    id: '6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01',
    title: 'a11y の記事を教えて',
    updatedAt: '2026-10-14T00:30:00.000Z',
    running: true,
  },
  {
    id: '0d9e8f7a-6b5c-4d3e-8f2a-1b0c9d8e7f62',
    title: 'View Transitions の記事を比べて',
    updatedAt: '2026-10-13T12:05:00.000Z',
    running: false,
  },
];

const meta = preview.meta({
  component: ThreadList,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  args: {
    threads,
    currentThreadId: '0d9e8f7a-6b5c-4d3e-8f2a-1b0c9d8e7f62',
  } satisfies Partial<ComponentProps<typeof ThreadList>>,
});

export const Empty = meta.story({
  args: { threads: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('まだ会話はありません。送ると履歴に残ります。'),
    ).toBeInTheDocument();
  },
});

export const WithThreads = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const running = canvas.getByRole('link', { name: /a11y の記事を教えて/u });
    await expect(running).toHaveAttribute(
      'href',
      '/chat/6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01',
    );
    await expect(running).not.toHaveAttribute('aria-current');
    await expect(within(running).getByText('生成中')).toBeInTheDocument();
    // 更新日時は日本時間で出す
    await expect(within(running).getByText('10/14 09:30')).toBeInTheDocument();

    const current = canvas.getByRole('link', {
      name: /View Transitions の記事を比べて/u,
    });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(within(current).queryByText('生成中')).not.toBeInTheDocument();
  },
});

const manyThreads: ThreadListItem[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `thread-${index.toString()}`,
    title: `会話 ${index.toString()}`,
    updatedAt: '2026-10-13T12:05:00.000Z',
    running: false,
  }),
);

export const CurrentBelowTheFold = meta.story({
  decorators: [
    (Story) => (
      <div className={styles.scroller} data-testid="scroller">
        <Story />
      </div>
    ),
  ],
  args: { threads: manyThreads, currentThreadId: 'thread-25' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 一覧の下のほうにある今のスレッドも、開いた時点で見えている
    const scroller = canvas.getByTestId('scroller').getBoundingClientRect();
    const current = canvas
      .getByRole('link', { name: /会話 25/u })
      .getBoundingClientRect();
    await expect(current.top).toBeGreaterThanOrEqual(scroller.top);
    await expect(current.bottom).toBeLessThanOrEqual(scroller.bottom);
  },
});
