'use client';

import { Alert, AssistantIcon, Avatar, RadioCard, Spinner } from '@k8ordo/ui';
import { Conversation, Message, PromptInput } from '@k8ordo/ui/ai';
import type { ChatStatus } from '@k8ordo/ui/ai';
import { useId } from 'react';
import type { FC } from 'react';

import type { AgentUIMessage } from '@/features/agent/application/agent-message';
import { PRICE_PER_MTOK_USD } from '@/features/usage/application/pricing';
import {
  GENERATION_MODEL_LABELS,
  GENERATION_MODELS,
  isGenerationModel,
} from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import { AgentMessage, hasVisiblePart } from '../agent-message';

import styles from './chat-view.module.css';

const MODEL_OPTIONS = GENERATION_MODELS.map((model) => ({
  value: model,
  label: GENERATION_MODEL_LABELS[model],
  description: `入力 $${PRICE_PER_MTOK_USD[model].input.toString()}・出力 $${PRICE_PER_MTOK_USD[model].output.toString()}（100万トークンあたり）`,
}));

const PendingReply: FC<{ label: string }> = ({ label }) => (
  <Message.Root
    avatar={
      <Avatar color="primary" icon={<AssistantIcon />} name="AI" size="sm" />
    }
    from="assistant"
  >
    <p className={styles.pending}>
      <Spinner label={label} size="sm" />
      <span aria-hidden>{label}</span>
    </p>
  </Message.Root>
);

const pendingLabelOf = (input: {
  isReceiving: boolean;
  isWaitingServer: boolean;
  isStopping: boolean;
  lastShown: AgentUIMessage | undefined;
}): string | null => {
  if (input.isStopping) {
    return '停止しています…';
  }
  if (input.isWaitingServer) {
    return '応答を生成しています（画面を離れても続きます）';
  }
  if (input.isReceiving && input.lastShown?.role !== 'assistant') {
    return '考えています…';
  }
  return null;
};

type EmptyStateProps = {
  model: GenerationModel;
  canSelectModel: boolean;
  onSelectModel: (model: GenerationModel) => void;
};

const EmptyState: FC<EmptyStateProps> = ({
  model,
  canSelectModel,
  onSelectModel,
}) => {
  const modelLabelId = useId();
  return (
    <div className={styles.empty}>
      <div className={styles.emptyText}>
        <p className={styles.emptyTitle}>k8o のブログについて聞く</p>
        <p className={styles.emptyHint}>
          記事を探して読み、要点をまとめたり比べたりします。
        </p>
      </div>
      {canSelectModel ? (
        <div className={styles.models}>
          <p className={styles.modelsLabel} id={modelLabelId}>
            モデル
          </p>
          <RadioCard
            aria-labelledby={modelLabelId}
            name="model"
            onChange={(value) => {
              if (isGenerationModel(value)) {
                onSelectModel(value);
              }
            }}
            options={MODEL_OPTIONS}
            value={model}
          />
        </div>
      ) : null}
    </div>
  );
};

type ChatViewProps = {
  messages: AgentUIMessage[];
  status: ChatStatus;
  isServerRunning: boolean;
  isStopping: boolean;
  errorText: string | null;
  draft: string;
  onDraftChange: (draft: string) => void;
  model: GenerationModel;
  canSelectModel: boolean;
  onSelectModel: (model: GenerationModel) => void;
  onSubmit: (text: string) => void;
  onStop: () => void;
};

export const ChatView: FC<ChatViewProps> = ({
  messages,
  status,
  isServerRunning,
  isStopping,
  errorText,
  draft,
  onDraftChange,
  model,
  canSelectModel,
  onSelectModel,
  onSubmit,
  onStop,
}) => {
  const isReceiving = status === 'submitted' || status === 'streaming';
  const isWaitingServer = isServerRunning && !isReceiving;
  // サーバーの生成を待つ間も送信を止め、停止ボタンを出す
  const inputStatus: ChatStatus = isWaitingServer ? 'submitted' : status;
  const isEmpty = messages.length === 0 && !isServerRunning && !isReceiving;
  const last = messages.at(-1);
  // 描くものが届く前の返答の行を出すと、空の行と待ちの行でアバターが2つ並ぶので、待ちの行だけにする
  const hidesLast =
    (isReceiving || isWaitingServer) &&
    last?.role === 'assistant' &&
    !hasVisiblePart(last, status === 'streaming');
  const shownMessages = hidesLast ? messages.slice(0, -1) : messages;
  const pendingLabel = pendingLabelOf({
    isReceiving,
    isWaitingServer,
    isStopping,
    lastShown: shownMessages.at(-1),
  });

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        {isEmpty ? (
          <EmptyState
            canSelectModel={canSelectModel}
            model={model}
            onSelectModel={onSelectModel}
          />
        ) : (
          <Conversation.Root>
            <Conversation.Messages
              isStreaming={status === 'streaming'}
              label="会話"
            >
              <div className={styles.conversation}>
                {shownMessages.map((message, index) => {
                  const isLast = index === messages.length - 1;
                  return (
                    <AgentMessage
                      isServerRunning={isWaitingServer && isLast}
                      isStreaming={status === 'streaming' && isLast}
                      key={message.id}
                      message={message}
                    />
                  );
                })}
                {pendingLabel === null ? null : (
                  <PendingReply label={pendingLabel} />
                )}
              </div>
            </Conversation.Messages>
            <Conversation.ScrollButton />
          </Conversation.Root>
        )}
      </div>
      <div className={styles.composer}>
        <div className={styles.composerInner}>
          {errorText === null ? null : (
            <Alert message={errorText} tone="error" />
          )}
          <PromptInput.Root
            onChange={onDraftChange}
            onStop={onStop}
            // 添付は受け付けないので、第2引数の FileList は渡さない
            onSubmit={(message) => {
              onSubmit(message);
            }}
            status={inputStatus}
            value={draft}
          >
            <PromptInput.Textarea placeholder="例: View Transitions の記事を要約して" />
            <PromptInput.Submit sendLabel="送信" stopLabel="停止" />
          </PromptInput.Root>
        </div>
      </div>
    </div>
  );
};
