import type { UIMessage } from 'ai';
import { useRef, useState } from 'react';
import type { ComponentProps, FC, ReactNode } from 'react';

import preview from '../../../../../.storybook/preview';
import { ChatPanel } from './chat-panel';

const noop = (): void => {
  // 見た目確認用のダミーハンドラ
};

const meta = preview.meta({
  component: ChatPanel,
  // propより狭い型（unionリテラル・null・[]）のままargsを推論させると
  // meta.storyの型推論が壊れるため、satisfiesで文脈型を与えて広げる
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
  } satisfies Partial<ComponentProps<typeof ChatPanel>>,
});

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

export const Default = meta.story({
  render: (args) => <InteractiveDemo {...args} />,
});

export const Empty = meta.story({
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
});

export const Generating = meta.story({
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
});
