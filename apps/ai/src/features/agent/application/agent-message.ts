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

type AgentMessageMetadata = { end?: RunEnd };

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

export type ServerSync = 'wait' | 'check';

// 最後まで受け取れたときは、SSE が閉じる前にサーバーが保存を終えているので読み直さない。
// エラーは送信を断られた（4xx）ときを含み、サーバーで生成していない見込みが高いので、待たずに1回だけ確かめる
export const serverSyncAfter = (finish: ChatFinish): ServerSync | null => {
  if (finish.isError) {
    return 'check';
  }
  if (
    finish.isAbort ||
    finish.isDisconnect ||
    finish.finishReason === undefined
  ) {
    return 'wait';
  }
  return null;
};
