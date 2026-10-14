import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import type {
  AgentUIMessage,
  RunEnd,
} from '@/features/agent/application/agent-message';
import type { GenerationModel } from '@/shared/claude/models';

import preview from '../../../../../../.storybook/preview';
import { ChatView } from './chat-view';

const question: AgentUIMessage = {
  id: 'u1',
  role: 'user',
  parts: [{ type: 'text', text: 'a11y の記事を教えて' }],
};

const answer: AgentUIMessage = {
  id: 'a1',
  role: 'assistant',
  metadata: { end: 'completed' },
  parts: [
    { type: 'step-start' },
    { type: 'reasoning', text: '一覧から探す。', state: 'done' },
    {
      type: 'tool-list_blogs',
      toolCallId: 'call-1',
      state: 'output-available',
      input: {},
      output: { items: [] },
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
      text: '**ariaNotify()** の記事があります。[記事](https://k8o.me/blog/arianotify)',
    },
  ],
};

const streamingAnswer: AgentUIMessage = {
  id: 'a2',
  role: 'assistant',
  parts: [
    { type: 'step-start' },
    {
      type: 'tool-read_blog',
      toolCallId: 'call-3',
      state: 'input-available',
      input: { slug: 'arianotify' },
    },
  ],
};

const endedAnswer = (end: RunEnd): AgentUIMessage => ({
  id: `end-${end}`,
  role: 'assistant',
  metadata: { end },
  parts: [{ type: 'text', state: 'done', text: `${end} の返答` }],
});

const meta = preview.meta({
  component: ChatView,
  decorators: [
    (Story) => (
      <div className="bg-bg-surface flex h-160 flex-col">
        <Story />
      </div>
    ),
  ],
  // propより狭い型（unionリテラル・null・[]）のままargsを推論させると
  // meta.storyの型推論が壊れるため、satisfiesで文脈型を与えて広げる
  args: {
    messages: [],
    status: 'ready',
    isServerRunning: false,
    errorText: null,
    model: 'claude-sonnet-5-5',
    canSelectModel: false,
    onSelectModel: fn<(model: GenerationModel) => void>(),
    onSubmit: fn<(text: string) => void>(),
    onStop: fn<() => void>(),
  } satisfies Partial<ComponentProps<typeof ChatView>>,
});

export const NewThread = meta.story({
  args: { canSelectModel: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('radio', { name: 'Sonnet 5.5' }),
    ).toBeChecked();
    await userEvent.click(canvas.getByRole('radio', { name: 'Opus 5.5' }));
    await expect(args.onSelectModel).toHaveBeenCalledWith('claude-opus-5-5');
    await userEvent.type(canvas.getByRole('textbox'), '最近の記事は？');
    await userEvent.click(canvas.getByRole('button', { name: '送信' }));
    await expect(args.onSubmit).toHaveBeenCalledWith('最近の記事は？');
  },
});

export const Conversation = meta.story({
  args: { messages: [question, answer] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('a11y の記事を教えて')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '思考の過程' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /list_blogs/u }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /read_blog/u }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('ariaNotify()').tagName).toBe('STRONG');
    await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
  },
});

export const Streaming = meta.story({
  args: { messages: [question, streamingAnswer], status: 'streaming' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const tool = canvas.getByRole('button', { name: /read_blog/u });
    await expect(within(tool).getByRole('status')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '停止' }));
    await expect(args.onStop).toHaveBeenCalledOnce();
  },
});

export const Submitted = meta.story({
  args: {
    messages: [question, { id: 'a3', role: 'assistant', parts: [] }],
    status: 'submitted',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 中身の無い返答の行は出さず、待ちの行だけを1つ出す
    await expect(canvas.getAllByRole('img', { name: 'AI' })).toHaveLength(1);
    await expect(
      canvas.getByRole('status', { name: '考えています…' }),
    ).toBeInTheDocument();
  },
});

export const StreamingBeforeFirstPart = meta.story({
  args: {
    messages: [
      question,
      {
        id: 'a3',
        role: 'assistant',
        parts: [
          { type: 'step-start' },
          { type: 'custom', kind: 'anthropic.message_start' },
        ],
      },
    ],
    status: 'streaming',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 描くものがまだ無いうちは、待ちの表示を消さない
    await expect(canvas.getAllByRole('img', { name: 'AI' })).toHaveLength(1);
    await expect(
      canvas.getByRole('status', { name: '考えています…' }),
    ).toBeInTheDocument();
  },
});

export const ServerRunning = meta.story({
  args: { messages: [question], isServerRunning: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('status', {
        name: '応答を生成しています（画面を離れても続きます）',
      }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '停止' }));
    await expect(args.onStop).toHaveBeenCalledOnce();
  },
});

export const ServerRunningAfterPartialReply = meta.story({
  args: { messages: [question, streamingAnswer], isServerRunning: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 受信は切れても、サーバーで続いている tool の呼び出しは止まったように描かない
    const tool = canvas.getByRole('button', { name: /read_blog/u });
    await expect(within(tool).getByRole('status')).toBeInTheDocument();
    await expect(
      canvas.getByRole('status', {
        name: '応答を生成しています（画面を離れても続きます）',
      }),
    ).toBeInTheDocument();
  },
});

export const ErrorText = meta.story({
  args: {
    messages: [question],
    status: 'error',
    errorText:
      '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
    );
  },
});

export const RunEnds = meta.story({
  args: {
    messages: [
      endedAnswer('stopped'),
      endedAnswer('step-limit'),
      endedAnswer('budget'),
      endedAnswer('failed'),
      endedAnswer('refused'),
      endedAnswer('length'),
      endedAnswer('timeout'),
      endedAnswer('completed'),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alerts = canvas
      .getAllByRole('alert')
      .map((alert) => alert.textContent);
    await expect(alerts).toStrictEqual([
      expect.stringContaining('停止しました'),
      expect.stringContaining(
        'ステップの上限（20回）に達したため止めました。続けるには続きを頼んでください',
      ),
      expect.stringContaining('今月の予算（$100）に達したため止めました'),
      expect.stringContaining('エラーで止まりました'),
      expect.stringContaining('Claude が回答を控えました'),
      expect.stringContaining('出力の上限に達したため止めました'),
      expect.stringContaining('時間の上限に達したため止めました'),
    ]);
  },
});

export const NarrowWidth = meta.story({
  decorators: [
    (Story) => (
      <div className="flex h-160 w-90 flex-col">
        <Story />
      </div>
    ),
  ],
  args: {
    messages: [
      question,
      {
        id: 'a4',
        role: 'assistant',
        metadata: { end: 'completed' },
        parts: [
          {
            type: 'text',
            state: 'done',
            text: [
              '[https://k8o.me/blog/a-very-long-slug-that-keeps-going-and-going-without-any-break](https://k8o.me/blog/a-very-long-slug-that-keeps-going-and-going-without-any-break)',
              '',
              '```ts',
              "const message = 'コードブロックの1行がとても長くても、画面の幅を押し広げずに横にスクロールさせる';",
              '```',
            ].join('\n'),
          },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = canvas.getByRole('log');
    await expect(log.scrollWidth).toBeLessThanOrEqual(log.clientWidth);
  },
});
