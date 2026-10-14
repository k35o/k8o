import type { ComponentProps } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import type { ThreadListItem } from '@/features/agent/application/threads';

import preview from '../../../../../.storybook/preview';
import { ChatHeader } from '../../chat/_components/chat-view';
import { ThreadList } from '../../chat/_components/thread-list';
import { SidebarSection } from './sidebar-section';
import { ToolFrame } from './tool-frame';
import { ToolHeader } from './tool-header';

const threads: ThreadListItem[] = [
  {
    id: '6f1c2a4e-0b7d-4c55-9a3e-2f8d1b6c9e01',
    title: 'a11y の記事を教えて',
    updatedAt: '2026-10-14T00:30:00.000Z',
    running: false,
  },
];

// Storybook の型は navigation に segments を持たないが、実行時は segments からルーターの木を組み、
// useSelectedLayoutSegment がそれを読む。型の注釈を付けない定数にして渡す
const chatNavigation = { pathname: '/chat', segments: ['chat'] };
const uiNavigation = { pathname: '/', segments: [] };

const meta = preview.meta({
  component: ToolFrame,
  decorators: [
    (Story) => (
      <div className="bg-bg-surface flex h-160 flex-col">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: { navigation: chatNavigation },
  },
  args: {
    sidebar: (
      <SidebarSection heading="履歴" newHref="/chat" newLabel="新しいチャット">
        <ThreadList currentThreadId={null} threads={threads} />
      </SidebarSection>
    ),
    children: (
      <>
        <ToolHeader>
          <ChatHeader model="claude-sonnet-5-5" title={null} />
        </ToolHeader>
        <div className="text-fg-mute flex flex-1 items-center justify-center text-sm">
          会話
        </div>
      </>
    ),
  } satisfies Partial<ComponentProps<typeof ToolFrame>>,
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
    await expect(
      sidebar.getByRole('button', { name: 'ログアウト' }),
    ).toBeInTheDocument();
  },
});

export const UiTool = meta.story({
  parameters: {
    nextjs: { navigation: uiNavigation },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = within(canvas.getByRole('navigation', { name: 'AI ツール' }));
    await expect(nav.getByRole('link', { name: 'UI' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      nav.getByRole('link', { name: 'チャット' }),
    ).not.toHaveAttribute('aria-current');
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
      drawer.getByRole('navigation', { name: 'AI ツール' }),
    ).toBeInTheDocument();
    await expect(
      drawer.getByRole('link', { name: '新しいチャット' }),
    ).toHaveAttribute('href', '/chat');
  },
});
