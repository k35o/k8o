import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { UIMessage } from 'ai';
import {
  type ComponentProps,
  type FC,
  type ReactNode,
  useRef,
  useState,
} from 'react';

import { ChatPanel } from './chat-panel';

const noop = (): void => {
  // 見た目確認用のダミーハンドラ
};

const meta = {
  component: ChatPanel,
  args: {
    status: 'ready',
    input: '',
    generatingStatus: 'UI を生成しています…',
    emptyStateTitle: 'UI を生成しましょう',
    emptyStateHint: '作りたい画面を入力すると、ここに会話が並びます。',
    errorText: null,
    selectedModel: 'fugu',
    onInputChange: noop,
    onSubmit: noop,
    onStop: noop,
    onSelectModel: noop,
    messages: [],
  },
} satisfies Meta<typeof ChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mkMessage = (
  id: string,
  role: 'user' | 'assistant',
  text: string,
): UIMessage =>
  ({ id, role, parts: [{ type: 'text', text }] }) as unknown as UIMessage;

const seed: UIMessage[] = [
  mkMessage('u1', 'user', 'お問い合わせフォームのカードを作って'),
  mkMessage('a1', 'assistant', ''),
  mkMessage('u2', 'user', '送信ボタンをもう少し目立たせて'),
  mkMessage('a2', 'assistant', ''),
];

const Frame: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="border-border-mute bg-bg-base flex h-160 w-110 flex-col border">
    {children}
  </div>
);

const InteractiveDemo: FC<ComponentProps<typeof ChatPanel>> = (args) => {
  const idRef = useRef(100);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<UIMessage[]>(seed);

  return (
    <Frame>
      <ChatPanel
        {...args}
        input={input}
        messages={messages}
        onInputChange={setInput}
        onSubmit={(text) => {
          const uid = (idRef.current += 1);
          const aid = (idRef.current += 1);
          setMessages((prev) => [
            ...prev,
            mkMessage(`u${uid.toString()}`, 'user', text),
            mkMessage(`a${aid.toString()}`, 'assistant', ''),
          ]);
          setInput('');
        }}
      />
    </Frame>
  );
};

export const Default: Story = {
  render: (args) => <InteractiveDemo {...args} />,
};

export const Empty: Story = {
  args: {
    messages: [],
    emptyStateTitle: 'UI を生成しましょう',
    emptyStateHint:
      '例: 「お問い合わせフォームのカード」「料金プランの3カラム」',
    suggestions: [
      'お問い合わせフォームのカード',
      '料金プランの3カラム',
      'ヒーローセクション',
    ],
  },
  render: (args) => (
    <Frame>
      <ChatPanel {...args} />
    </Frame>
  ),
};

export const Generating: Story = {
  args: {
    status: 'streaming',
    messages: [
      mkMessage('u1', 'user', 'ヒーローセクションを作って'),
      mkMessage('a1', 'assistant', ''),
    ],
    generatingStatus: 'UI を生成しています…（42 行）',
  },
  render: (args) => (
    <Frame>
      <ChatPanel {...args} />
    </Frame>
  ),
};
