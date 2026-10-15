import type { FinishReason, UIMessageStreamOutcome } from 'ai';

import type { AgentUIMessage, RunEnd } from './agent-message';

export const MAX_STEPS = 20;
// 1ステップの出力の上限。thinking のトークンも数える
export const MAX_OUTPUT_TOKENS = 32_000;
// route の maxDuration（800 秒）で関数ごと止められる前に中断し、途中までの返答を保存する
export const RUN_TIMEOUT_MS = 750_000;
export const TOOL_TIMEOUT_MS = 30_000;
export const STOP_POLL_MS = 1000;
const HEARTBEAT_STALE_MS = 30_000;
// 文脈の上限（100万トークン）に届いて以後の要求がすべて断られる前に、新しいチャットへ移ってもらう
export const MAX_CONTEXT_INPUT_TOKENS = 800_000;

export const heartbeatStaleBeforeIso = (now: number): string =>
  new Date(now - HEARTBEAT_STALE_MS).toISOString();

export const isRunActive = (
  run: { runId: string | null; runHeartbeatAt: string | null },
  now: number,
): boolean =>
  run.runId !== null &&
  run.runHeartbeatAt !== null &&
  run.runHeartbeatAt >= heartbeatStaleBeforeIso(now);

export const endOfFinish = (
  finishReason: FinishReason,
  budgetExceeded: boolean,
): RunEnd => {
  switch (finishReason) {
    case 'stop':
      return 'completed';
    // tool を呼んだステップのあとで、続けずに打ち切った
    case 'tool-calls':
      return budgetExceeded ? 'budget' : 'step-limit';
    case 'content-filter':
      return 'refused';
    case 'length':
      return 'length';
    case 'error':
    case 'other':
      return 'failed';
  }
};

const endOfUnfinished = (
  outcome: UIMessageStreamOutcome,
  stopRequested: boolean,
): RunEnd => {
  switch (outcome.status) {
    case 'aborted':
      return stopRequested ? 'stopped' : 'timeout';
    case 'completed':
      return 'completed';
    case 'failed':
    case 'unknown':
      return 'failed';
  }
};

// finish が流れずに終わった実行（中断や、ストリームの例外）にも終わり方の印を付ける
export const withRunEnd = (
  message: AgentUIMessage,
  input: { outcome: UIMessageStreamOutcome; stopRequested: boolean },
): AgentUIMessage =>
  message.metadata?.end === undefined
    ? {
        ...message,
        metadata: {
          ...message.metadata,
          end: endOfUnfinished(input.outcome, input.stopRequested),
        },
      }
    : message;
