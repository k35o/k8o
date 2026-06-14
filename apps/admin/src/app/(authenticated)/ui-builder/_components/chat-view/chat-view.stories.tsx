import type { ChatMessage } from '@json-render/react';
import type { ArteSpec } from '@k8o/arte-odyssey/json-render';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { ChatView } from './chat-view';

const sampleSpec = {
  root: 'root',
  elements: {
    root: {
      type: 'Stack',
      props: { direction: 'column', gap: 'sm' },
      children: ['title', 'submit'],
    },
    title: { type: 'Heading', props: { text: 'ログイン', level: 'h3' } },
    submit: {
      type: 'Button',
      props: { label: 'サインイン', color: 'primary' },
    },
  },
} satisfies ArteSpec;

const conversation: ChatMessage[] = [
  { id: '1', role: 'user', text: 'ログインフォームを作って', spec: null },
  {
    id: '2',
    role: 'assistant',
    text: 'ログインフォームを作成しました。',
    spec: sampleSpec,
  },
];

const meta: Meta<typeof ChatView> = {
  title: 'admin/ui-builder/chat-view',
  component: ChatView,
  args: {
    isStreaming: false,
    error: null,
    onSend: fn(() => {}),
    onClear: fn(() => {}),
  },
};

export default meta;
type Story = StoryObj<typeof ChatView>;

export const Empty: Story = {
  args: {
    messages: [],
  },
  play: async ({ args, canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // 作成例のボタンが提示され、クリックでそのまま送信される
    const example = canvas.getByRole('button', {
      name: '料金プランの比較テーブル',
    });
    await userEvent.click(example);
    await expect(args.onSend).toHaveBeenCalledWith('料金プランの比較テーブル');
  },
};

export const Conversation: Story = {
  args: {
    messages: conversation,
  },
  play: async ({ canvasElement }) => {
    // 地の文と、spec から生成された UI の両方が描画される
    await expect(canvasElement.textContent).toContain(
      'ログインフォームを作成しました',
    );
    await expect(canvasElement.textContent).toContain('サインイン');
  },
};

export const Streaming: Story = {
  args: {
    isStreaming: true,
    messages: [
      { id: '1', role: 'user', text: '商品カードを並べて', spec: null },
      { id: '2', role: 'assistant', text: '', spec: null },
    ],
  },
};

export const ErrorState: Story = {
  args: {
    messages: conversation,
    error: new Error('生成に失敗しました'),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.textContent).toContain('生成に失敗しました');
  },
};
