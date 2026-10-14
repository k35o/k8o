import type { ComponentProps } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import type { ThreadListItem } from '@/features/agent/application/threads';

import preview from '../../../../../../.storybook/preview';
import { ChatHeader } from '../chat-view';
import { ChatShell } from './chat-shell';

const threads: ThreadListItem[] = [
  {
    id: '6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01',
    title: 'a11y の記事を教えて',
    updatedAt: '2026-10-14T00:30:00.000Z',
    running: false,
  },
];

const meta = preview.meta({
  component: ChatShell,
  decorators: [
    (Story) => (
      <div className="bg-bg-surface flex h-160 flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    threads,
    currentThreadId: '9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d',
    header: <ChatHeader model="claude-sonnet-5-5" title={null} />,
    children: (
      <div className="text-fg-mute flex flex-1 items-center justify-center text-sm">
        会話
      </div>
    ),
  } satisfies Partial<ComponentProps<typeof ChatShell>>,
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: '新しいチャット' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Sonnet 5.5')).toBeInTheDocument();

    const sidebar = within(canvas.getByRole('complementary'));
    const nav = within(sidebar.getByRole('navigation', { name: 'AI ツール' }));
    await expect(nav.getByRole('link', { name: 'チャット' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      sidebar.getByRole('link', { name: '新しいチャット' }),
    ).toHaveAttribute('href', '/chat');
    await expect(
      sidebar.getByRole('link', { name: /a11y の記事を教えて/u }),
    ).toHaveAttribute('href', '/chat/6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01');
  },
});

export const MenuDrawer = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // テストのビューポートは lg 以上に固定されていて、メニューのボタンは隠れているため、
    // 隠れた要素も含めて探して押す
    await userEvent.click(
      canvas.getByRole('button', { name: 'メニューを開く', hidden: true }),
    );
    const drawer = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog'),
    );
    await expect(
      drawer.getByRole('link', { name: '新しいチャット' }),
    ).toHaveAttribute('href', '/chat');
    await expect(
      drawer.getByRole('navigation', { name: 'AI ツール' }),
    ).toBeInTheDocument();
  },
});
