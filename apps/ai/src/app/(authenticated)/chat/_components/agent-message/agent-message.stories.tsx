import { expect, userEvent, within } from 'storybook/test';

import type { AgentUIMessage } from '@/features/agent/application/agent-message';

import preview from '../../../../../../.storybook/preview';
import { AgentMessage } from './agent-message';

const answer: AgentUIMessage = {
  id: 'a1',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    {
      type: 'reasoning',
      text: '記事の一覧から a11y の記事を探す。',
      state: 'done',
    },
    { type: 'reasoning', text: '', state: 'done' },
    {
      type: 'tool-list_blogs',
      toolCallId: 'call-1',
      state: 'output-available',
      input: {},
      output: {
        items: [
          {
            slug: 'arianotify',
            title:
              'ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる',
            description:
              'ariaNotify()は、DOMを書き換えずに読み上げさせるメソッドです。',
            tags: ['a11y', 'JavaScript'],
            publishedAt: '2026-09-28T00:00:00.000Z',
            url: 'https://k8o.me/blog/arianotify',
          },
        ],
      },
    },
    {
      type: 'tool-read_blog',
      toolCallId: 'call-2',
      state: 'output-error',
      input: { slug: 'missing' },
      errorText: '記事が見つかりません: missing',
    },
    {
      type: 'text',
      state: 'done',
      text: [
        '## まとめ',
        '',
        '- `ariaNotify()` は DOM を書き換えずに読み上げさせます',
        '- **ライブリージョン**を置かなくて済みます',
        '',
        '詳しくは[記事](https://k8o.me/blog/arianotify)を読んでください。',
        '',
        '![図](https://example.com/figure.png)',
        '',
        '```ts',
        "document.ariaNotify('保存しました');",
        '```',
      ].join('\n'),
    },
  ],
};

const inProgressParts: AgentUIMessage['parts'] = [
  { type: 'step-start' },
  { type: 'reasoning', text: '本文を読んで比べる。', state: 'streaming' },
  {
    type: 'tool-read_blog',
    toolCallId: 'call-3',
    state: 'input-available',
    input: { slug: 'arianotify' },
  },
];

const meta = preview.meta({
  component: AgentMessage,
  args: {
    message: answer,
    isStreaming: false,
  },
});

export const UserMessage = meta.story({
  args: {
    message: {
      id: 'u1',
      role: 'user',
      parts: [{ type: 'text', text: 'a11y の記事を教えて' }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('a11y の記事を教えて')).toBeInTheDocument();
  },
});

export const Answer = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 中身が空の reasoning は描かない
    await expect(
      canvas.getAllByRole('button', { name: '思考の過程' }),
    ).toHaveLength(1);
    await expect(
      canvas.getByRole('button', { name: /list_blogs/u }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /read_blog/u }));
    await expect(
      canvas.getByText('記事が見つかりません: missing'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('heading', { name: 'まとめ' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('ariaNotify()').tagName).toBe('CODE');
    await expect(canvas.getByRole('link', { name: /記事/u })).toHaveAttribute(
      'href',
      'https://k8o.me/blog/arianotify',
    );
    await expect(
      canvas.getByText("document.ariaNotify('保存しました');"),
    ).toBeInTheDocument();
    await expect(canvas.queryByAltText('図')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
});

export const Streaming = meta.story({
  args: {
    message: { id: 'a2', role: 'assistant', parts: inProgressParts },
    isStreaming: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: '思考中…' }),
    ).toBeInTheDocument();
    const tool = canvas.getByRole('button', { name: /read_blog/u });
    await expect(within(tool).getByRole('status')).toBeInTheDocument();
  },
});

export const Stopped = meta.story({
  args: {
    message: {
      id: 'a3',
      role: 'assistant',
      metadata: { end: 'stopped' },
      parts: inProgressParts,
    },
    isStreaming: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 受信していない返答は、保存された state が streaming のままでも思考中にしない
    await expect(
      canvas.getByRole('button', { name: '思考の過程' }),
    ).toBeInTheDocument();
    const tool = canvas.getByRole('button', { name: /read_blog/u });
    await expect(within(tool).queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(tool);
    await expect(canvas.getByText('完了する前に止まりました')).toBeVisible();
    await expect(canvas.getByRole('alert')).toHaveTextContent('停止しました');
  },
});
