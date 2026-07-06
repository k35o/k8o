'use client';

import { AssistantIcon, Avatar, Button } from '@k8o/arte-odyssey';
import {
  type ChatStatus,
  Conversation,
  Message,
  PromptInput,
  Suggestion,
} from '@k8o/arte-odyssey/ai';
import type { UIMessage } from 'ai';
import { type FC, memo, type ReactNode } from 'react';

import {
  messageText,
  parseGeneration,
} from '@/features/generation/application/parse-generation';

type Model = 'fugu' | 'fugu-ultra';

const NO_SUGGESTIONS: string[] = [];

const AssistantRow: FC<{ children: ReactNode }> = ({ children }) => (
  <Message.Root from="assistant">
    <Avatar color="primary" icon={<AssistantIcon />} name="AI" size="sm" />
    <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
  </Message.Root>
);

// 確定済み assistant メッセージ。履歴はストリーミング中に毎トークン再パースされないよう memo する。
const AssistantDescription = memo(
  ({ message }: { message: UIMessage }) => {
    const description =
      parseGeneration(messageText(message)).meta?.description ??
      'コードを更新しました';
    return <Message.Content>{description}</Message.Content>;
  },
  (prev, next) =>
    prev.message.id === next.message.id &&
    messageText(prev.message) === messageText(next.message),
);
AssistantDescription.displayName = 'AssistantDescription';

type Props = {
  messages: UIMessage[];
  status: ChatStatus;
  input: string;
  generatingStatus: string;
  emptyStateTitle: string;
  emptyStateHint: string;
  suggestions?: string[];
  errorText: string | null;
  selectedModel: Model;
  onInputChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop: () => void;
  onSelectModel: (model: Model) => void;
};

export const ChatPanel: FC<Props> = ({
  messages,
  status,
  input,
  generatingStatus,
  emptyStateTitle,
  emptyStateHint,
  suggestions = NO_SUGGESTIONS,
  errorText,
  selectedModel,
  onInputChange,
  onSubmit,
  onStop,
  onSelectModel,
}) => {
  const isBusy = status === 'submitted' || status === 'streaming';
  const lastMessageId = messages.at(-1)?.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex flex-col gap-2">
              <p className="text-fg-base text-sm font-bold">
                {emptyStateTitle}
              </p>
              <p className="text-fg-mute text-sm leading-relaxed">
                {emptyStateHint}
              </p>
            </div>
            {suggestions.length > 0 ? (
              <div className="flex justify-center">
                <Suggestion.List label="例">
                  {suggestions.map((suggestion) => (
                    <Suggestion.Item
                      key={suggestion}
                      onSelect={onSubmit}
                      value={suggestion}
                    >
                      {suggestion}
                    </Suggestion.Item>
                  ))}
                </Suggestion.List>
              </div>
            ) : null}
          </div>
        ) : (
          <Conversation.Root>
            <Conversation.Messages isStreaming={isBusy} label="生成の会話">
              {messages.map((message) => {
                if (message.role === 'user') {
                  return (
                    <Message.Root from="user" key={message.id}>
                      <Message.Content>{messageText(message)}</Message.Content>
                    </Message.Root>
                  );
                }
                const working = isBusy && message.id === lastMessageId;
                return (
                  <AssistantRow key={message.id}>
                    {working ? (
                      <Message.Content isStreaming>
                        {generatingStatus}
                      </Message.Content>
                    ) : (
                      <AssistantDescription message={message} />
                    )}
                  </AssistantRow>
                );
              })}
              {status === 'submitted' ? (
                <AssistantRow>
                  <Message.Content isStreaming>
                    {generatingStatus}
                  </Message.Content>
                </AssistantRow>
              ) : null}
            </Conversation.Messages>
            <Conversation.ScrollButton />
          </Conversation.Root>
        )}
      </div>

      <div className="border-border-mute flex flex-col gap-2 border-t p-4">
        <PromptInput.Root
          onChange={onInputChange}
          onStop={onStop}
          onSubmit={onSubmit}
          status={status}
          value={input}
        >
          <PromptInput.Textarea placeholder="作りたい画面を入力（例: お問い合わせフォームのカード）" />
          <PromptInput.Submit sendLabel="生成する" stopLabel="停止" />
        </PromptInput.Root>
        <div className="flex items-center gap-2">
          <span className="text-fg-mute text-xs">モデル</span>
          <Button
            color="gray"
            disabled={isBusy}
            onClick={() => {
              onSelectModel('fugu');
            }}
            size="sm"
            variant={selectedModel === 'fugu' ? 'solid' : 'skeleton'}
          >
            fugu
          </Button>
          <Button
            color="gray"
            disabled={isBusy}
            onClick={() => {
              onSelectModel('fugu-ultra');
            }}
            size="sm"
            variant={selectedModel === 'fugu-ultra' ? 'solid' : 'skeleton'}
          >
            ultra
          </Button>
          {errorText === null ? null : (
            <span className="text-fg-error ml-auto text-xs leading-relaxed">
              {errorText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
