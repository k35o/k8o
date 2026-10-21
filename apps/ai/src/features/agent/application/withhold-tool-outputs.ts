import { getStaticToolName, isStaticToolUIPart } from 'ai';
import type { InferUITools } from 'ai';

import type { AgentUIMessage } from './agent-message';
import type { agentTools, WithholdsOutput } from './tools';

type AgentPart = AgentUIMessage['parts'][number];

type WithheldPart = Extract<
  AgentPart,
  { state: 'output-available'; output: string }
>;

export const WITHHELD_OUTPUT_TEXT =
  'この出力は保存していません。中身が要るときは、同じ入力でもう一度呼んでください';

const isWithheld = (
  part: AgentPart,
  withholds: WithholdsOutput,
): part is WithheldPart =>
  isStaticToolUIPart(part) &&
  part.state === 'output-available' &&
  // 型引数を省くと、絞り込んだ part から名前の型を推論できず string になる
  withholds[getStaticToolName<InferUITools<typeof agentTools>>(part)];

// 置き換えた出力より後ろの thinking は原文に結び付いていて、送り返すと API に毎回落とされるので、
// 保存する前に外す
export const withholdToolOutputs = (
  message: AgentUIMessage,
  withholds: WithholdsOutput,
): AgentUIMessage => {
  const firstWithheld = message.parts.findIndex((part) =>
    isWithheld(part, withholds),
  );
  if (firstWithheld === -1) {
    return message;
  }
  return {
    ...message,
    parts: message.parts.flatMap((part, index): AgentPart[] => {
      if (isWithheld(part, withholds)) {
        return [{ ...part, output: WITHHELD_OUTPUT_TEXT }];
      }
      return index > firstWithheld && part.type === 'reasoning' ? [] : [part];
    }),
  };
};
