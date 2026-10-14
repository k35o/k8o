import type {
  ChatOnFinishCallback,
  InferUITools,
  UIDataTypes,
  UIMessage,
} from 'ai';

import type { agentTools } from './tools';

export type RunEnd =
  | 'completed'
  | 'step-limit'
  | 'budget'
  | 'refused'
  | 'length'
  | 'failed'
  | 'stopped'
  | 'timeout';

export type AgentMessageMetadata = { end?: RunEnd };

export type AgentUIMessage = UIMessage<
  AgentMessageMetadata,
  UIDataTypes,
  InferUITools<typeof agentTools>
>;

const MAX_TITLE_CHARS = 40;

export const threadTitleFrom = (message: AgentUIMessage): string => {
  const text = message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join(' ')
    .replaceAll(/\s+/gu, ' ')
    .trim();
  // サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
  const chars = Array.from(text);
  return chars.length <= MAX_TITLE_CHARS
    ? text
    : `${chars.slice(0, MAX_TITLE_CHARS).join('')}…`;
};

type ChatFinish = Parameters<ChatOnFinishCallback<AgentUIMessage>>[0];

// 最後まで受け取れたときは、SSE が閉じる前にサーバーが保存を終えているので読み直さない
export const needsServerSync = (finish: ChatFinish): boolean =>
  finish.isAbort ||
  finish.isDisconnect ||
  finish.isError ||
  finish.finishReason === undefined;
