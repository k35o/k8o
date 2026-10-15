'use client';

import { AssistantIcon, Avatar, Button } from '@k8ordo/ui';
import { Conversation, Message, PromptInput, Suggestion } from '@k8ordo/ui/ai';
import type { ChatStatus } from '@k8ordo/ui/ai';
import type { UIMessage } from 'ai';
import { memo } from 'react';
import type { FC, ReactNode } from 'react';

import { messageText } from '@/features/generation/application/message-text';
import { parseSpecProse } from '@/features/generation/application/spec-message';
import {
  GENERATION_MODEL_LABELS,
  GENERATION_MODELS,
} from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import styles from './chat-panel.module.css';

const NO_SUGGESTIONS: string[] = [];

const AssistantRow: FC<{ children: ReactNode }> = ({ children }) => (
  <Message.Root
    avatar={
      <Avatar color="primary" icon={<AssistantIcon />} name="AI" size="sm" />
    }
    from="assistant"
  >
    {children}
  </Message.Root>
);

// 生成テキストから吹き出しに出す説明文を取り出す。スタジオ（UI / スライド）ごとに
// 出力フォーマットが違うため差し替え可能にする（モジュールレベルの定数を渡すこと）。
type DescribeMessage = (text: string) => string | null;

// 会話文（タイトル行 + 説明）から説明だけを取り出す。パッチは data パーツに
// 分離済みなので text には含まれない。
const describeUiMessage: DescribeMessage = (text) => {
  const { description } = parseSpecProse(text);
  return description === '' ? null : description;
};

// 確定済み assistant メッセージ。履歴はストリーミング中に毎トークン再パースされないよう memo する。
const AssistantDescription = memo(
  ({
    message,
    describe,
  }: {
    message: UIMessage;
    describe: DescribeMessage;
  }) => {
    const description = describe(messageText(message)) ?? '内容を更新しました';
    return <Message.Content>{description}</Message.Content>;
  },
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.describe === next.describe &&
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
  selectedModel: GenerationModel;
  inputPlaceholder?: string;
  describeMessage?: DescribeMessage;
  onInputChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop: () => void;
  onSelectModel: (model: GenerationModel) => void;
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
  inputPlaceholder = '作りたい画面を入力（例: お問い合わせフォームのカード）',
  describeMessage = describeUiMessage,
  onInputChange,
  onSubmit,
  onStop,
  onSelectModel,
}) => {
  const isBusy = status === 'submitted' || status === 'streaming';
  const lastMessageId = messages.at(-1)?.id;

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyText}>
              <p className={styles.emptyTitle}>{emptyStateTitle}</p>
              <p className={styles.emptyHint}>{emptyStateHint}</p>
            </div>
            {suggestions.length > 0 ? (
              <div className={styles.suggestions}>
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
                      <AssistantDescription
                        describe={describeMessage}
                        message={message}
                      />
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

      <div className={styles.composer}>
        <PromptInput.Root
          onChange={onInputChange}
          onStop={onStop}
          // 添付は受け付けないので、第2引数の FileList は渡さない
          onSubmit={(message) => {
            onSubmit(message);
          }}
          status={status}
          value={input}
        >
          <PromptInput.Textarea placeholder={inputPlaceholder} />
          <PromptInput.Submit sendLabel="生成する" stopLabel="停止" />
        </PromptInput.Root>
        <div className={styles.models}>
          <span className={styles.modelsLabel}>モデル</span>
          {GENERATION_MODELS.map((model) => (
            <Button
              color="base"
              disabled={isBusy}
              key={model}
              onClick={() => {
                onSelectModel(model);
              }}
              size="sm"
              variant={selectedModel === model ? 'solid' : 'skeleton'}
            >
              {GENERATION_MODEL_LABELS[model]}
            </Button>
          ))}
          {errorText === null ? null : (
            <span className={styles.error}>{errorText}</span>
          )}
        </div>
      </div>
    </div>
  );
};
