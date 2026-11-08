import { Badge } from '@k8ordo/ui';
import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { SidebarList } from './sidebar-list';
import type { SidebarListEntry } from './sidebar-list';

import styles from './sidebar-list.stories.module.css';

const entries: SidebarListEntry[] = [
  {
    id: 'first',
    title: '料金表',
    updatedAt: '2026-10-14T00:30:00.000Z',
    titleBadge: <Badge label="公開" size="sm" tone="success" />,
    metaBadge: <Badge label="UI" size="sm" />,
  },
  {
    id: 'second',
    title: 'TypeScript 入門',
    updatedAt: '2026-10-13T12:05:00.000Z',
  },
];

const meta = preview.meta({
  component: SidebarList,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  args: {
    basePath: '/artifacts',
    entries,
    currentId: 'second',
    emptyText: 'まだ何もありません。',
  } satisfies Partial<ComponentProps<typeof SidebarList>>,
});

export const Empty = meta.story({
  args: { entries: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('まだ何もありません。')).toBeInTheDocument();
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  },
});

export const WithEntries = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('link', { name: /料金表/u });
    await expect(first).toHaveAttribute('href', '/artifacts/first');
    await expect(first).not.toHaveAttribute('aria-current');
    await expect(within(first).getByText('公開')).toBeInTheDocument();
    await expect(within(first).getByText('UI')).toBeInTheDocument();
    // 更新日時は日本時間で出す
    await expect(within(first).getByText('10/14 09:30')).toBeInTheDocument();

    const current = canvas.getByRole('link', { name: /TypeScript 入門/u });
    await expect(current).toHaveAttribute('href', '/artifacts/second');
    await expect(current).toHaveAttribute('aria-current', 'page');
  },
});

const manyEntries: SidebarListEntry[] = Array.from(
  { length: 30 },
  (_, index) => ({
    id: `entry-${index.toString()}`,
    title: `項目 ${index.toString()}`,
    updatedAt: '2026-10-13T12:05:00.000Z',
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
  args: { entries: manyEntries, currentId: 'entry-25' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 一覧の下のほうにある今の項目も、開いた時点で見えている
    const scroller = canvas.getByTestId('scroller').getBoundingClientRect();
    const current = canvas
      .getByRole('link', { name: /項目 25/u })
      .getBoundingClientRect();
    await expect(current.top).toBeGreaterThanOrEqual(scroller.top);
    await expect(current.bottom).toBeLessThanOrEqual(scroller.bottom);
  },
});
