'use client';

import { Alert, AssistantIcon, Avatar } from '@k8ordo/ui';
import { Message, Reasoning, ToolInvocation } from '@k8ordo/ui/ai';
import type { FC, Ref } from 'react';

import type {
  AgentUIMessage,
  RunEnd,
} from '@/features/agent/application/agent-message';
import { MAX_STEPS } from '@/features/agent/application/agent-run';
import { chatArtifactOf } from '@/features/agent/application/chat-artifacts';
import { MONTHLY_BUDGET_MICRO_USD } from '@/features/usage/application/budget';

import { ArtifactCard } from '../artifact-card';
import { MarkdownText } from '../markdown-text';

type AgentMessagePart = AgentUIMessage['parts'][number];
type AgentToolPart = Extract<AgentMessagePart, { type: `tool-${string}` }>;

const RUN_END_MESSAGES = {
  stopped: '停止しました',
  'step-limit': `ステップの上限（${MAX_STEPS.toString()}回）に達したため止めました。続けるには続きを頼んでください`,
  budget: `今月の予算（$${(MONTHLY_BUDGET_MICRO_USD / 1_000_000).toString()}）に達したため止めました`,
  failed: 'エラーで止まりました',
  refused: 'Claude が回答を控えました',
  length: '出力の上限に達したため止めました',
  timeout: '時間の上限に達したため止めました',
} as const satisfies Record<Exclude<RunEnd, 'completed'>, string>;

const textOf = (message: AgentUIMessage): string =>
  message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n');

const toolOutputText = (output: unknown): string =>
  typeof output === 'string' ? output : JSON.stringify(output, null, 2);

const ToolPart: FC<{ part: AgentToolPart; isGenerating: boolean }> = ({
  part,
  isGenerating,
}) => {
  const name = part.type.slice('tool-'.length);
  // 止めた返答には、入力の状態のまま終わった呼び出しが残る。待ち続ける表示にしない
  if (
    !isGenerating &&
    (part.state === 'input-streaming' || part.state === 'input-available')
  ) {
    return (
      <ToolInvocation
        errorText="完了する前に止まりました"
        input={part.input}
        name={name}
        state="output-error"
      />
    );
  }
  switch (part.state) {
    case 'output-available':
      return (
        <ToolInvocation
          input={part.input}
          name={name}
          output={toolOutputText(part.output)}
          state={part.state}
        />
      );
    case 'output-error':
      return (
        <ToolInvocation
          errorText={part.errorText}
          input={part.input}
          name={name}
          state={part.state}
        />
      );
    default:
      return (
        <ToolInvocation input={part.input} name={name} state={part.state} />
      );
  }
};

// 止めた返答の reasoning は streaming のまま保存されるので、受信中のときだけ思考中にする
const isThinking = (
  part: Extract<AgentMessagePart, { type: 'reasoning' }>,
  isStreaming: boolean,
): boolean => isStreaming && part.state === 'streaming';

const rendersPart = (part: AgentMessagePart, isStreaming: boolean): boolean => {
  switch (part.type) {
    case 'text':
    case 'tool-list_blogs':
    case 'tool-read_blog':
    case 'tool-generate_ui':
    case 'tool-generate_slides':
    case 'tool-list_github_repos':
    case 'tool-read_github_file':
    case 'tool-search_github_code':
    case 'tool-search_github_issues':
    case 'tool-read_github_issue':
      return true;
    case 'reasoning':
      return part.text.trim() !== '' || isThinking(part, isStreaming);
    default:
      return false;
  }
};

export const hasVisiblePart = (
  message: AgentUIMessage,
  isStreaming: boolean,
): boolean => message.parts.some((part) => rendersPart(part, isStreaming));

type ArtifactSelection = {
  selectedToolCallId: string | null;
  onOpenArtifact: (toolCallId: string) => void;
  artifactButtonRef?:
    | ((toolCallId: string) => Ref<HTMLButtonElement>)
    | undefined;
};

const AgentPart: FC<
  {
    part: AgentMessagePart;
    isStreaming: boolean;
    isServerRunning: boolean;
    isStopping: boolean;
  } & ArtifactSelection
> = ({
  part,
  isStreaming,
  isServerRunning,
  isStopping,
  selectedToolCallId,
  onOpenArtifact,
  artifactButtonRef,
}) => {
  if (!rendersPart(part, isStreaming)) {
    return null;
  }
  switch (part.type) {
    case 'text':
      return (
        <Message.Content
          isStreaming={isStreaming && part.state === 'streaming'}
        >
          <MarkdownText>{part.text}</MarkdownText>
        </Message.Content>
      );
    case 'reasoning':
      return (
        <Reasoning isStreaming={isThinking(part, isStreaming)}>
          {part.text}
        </Reasoning>
      );
    case 'tool-list_blogs':
    case 'tool-read_blog':
    case 'tool-list_github_repos':
    case 'tool-read_github_file':
    case 'tool-search_github_code':
    case 'tool-search_github_issues':
    case 'tool-read_github_issue':
      return (
        <ToolPart isGenerating={isStreaming || isServerRunning} part={part} />
      );
    case 'tool-generate_ui':
    case 'tool-generate_slides':
      return (
        <ArtifactCard
          artifact={chatArtifactOf(part, {
            live: isStreaming
              ? 'receiving'
              : isServerRunning
                ? 'waiting'
                : null,
            isStopping,
          })}
          buttonRef={artifactButtonRef?.(part.toolCallId)}
          isActive={selectedToolCallId === part.toolCallId}
          onOpen={() => {
            onOpenArtifact(part.toolCallId);
          }}
        />
      );
    default:
      return null;
  }
};

const partKey = (part: AgentMessagePart, index: number): string =>
  'toolCallId' in part ? part.toolCallId : `${part.type}-${index.toString()}`;

type AgentMessageProps = {
  message: AgentUIMessage;
  isStreaming: boolean;
  isServerRunning: boolean;
  isStopping: boolean;
} & ArtifactSelection;

export const AgentMessage: FC<AgentMessageProps> = ({
  message,
  isStreaming,
  isServerRunning,
  isStopping,
  selectedToolCallId,
  onOpenArtifact,
  artifactButtonRef,
}) => {
  if (message.role === 'user') {
    return (
      <Message.Root from="user">
        <Message.Content>{textOf(message)}</Message.Content>
      </Message.Root>
    );
  }
  const end = message.metadata?.end;
  return (
    <Message.Root
      avatar={
        <Avatar color="primary" icon={<AssistantIcon />} name="AI" size="sm" />
      }
      from="assistant"
    >
      {message.parts.map((part, index) => (
        <AgentPart
          artifactButtonRef={artifactButtonRef}
          isServerRunning={isServerRunning}
          isStopping={isStopping}
          isStreaming={isStreaming}
          key={partKey(part, index)}
          onOpenArtifact={onOpenArtifact}
          part={part}
          selectedToolCallId={selectedToolCallId}
        />
      ))}
      {end === undefined || end === 'completed' ? null : (
        <Alert message={RUN_END_MESSAGES[end]} tone="warning" />
      )}
    </Message.Root>
  );
};
