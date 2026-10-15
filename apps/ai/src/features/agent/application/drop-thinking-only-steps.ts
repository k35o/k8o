import { isToolUIPart } from 'ai';

import type { AgentUIMessage } from './agent-message';

type AgentPart = AgentUIMessage['parts'][number];

// convertToModelMessages の ignoreIncompleteToolCalls が落とす tool のパーツ
const isIncompleteToolPart = (part: AgentPart): boolean =>
  isToolUIPart(part) &&
  !(
    (part.state === 'output-available' && part.preliminary !== true) ||
    part.state === 'output-error' ||
    part.state === 'output-denied' ||
    part.state === 'approval-responded'
  );

// custom（anthropic.message_start など）は、Claude に送るときに捨てられる
const sendsOnlyThinking = (step: AgentPart[]): boolean =>
  step.every(
    (part) =>
      part.type === 'step-start' ||
      part.type === 'reasoning' ||
      part.type === 'custom' ||
      isIncompleteToolPart(part),
  );

const splitSteps = (parts: AgentPart[]): AgentPart[][] => {
  const steps: AgentPart[][] = [];
  for (const part of parts) {
    const current = steps.at(-1);
    if (part.type === 'step-start' || current === undefined) {
      steps.push([part]);
    } else {
      current.push(part);
    }
  }
  return steps;
};

// 文を書かずに tool を呼んだステップを止めると、tool の呼び出しが落ちて thinking だけの assistant が
// 送られる。API が受けるか確かめられないので、そのステップごと送らない。止めたステップの thinking は
// 次のターンで初めて送るものなので、落としても、前に送った履歴とは食い違わない
export const dropThinkingOnlySteps = (
  messages: AgentUIMessage[],
): AgentUIMessage[] =>
  messages.map((message) =>
    message.role === 'assistant'
      ? {
          ...message,
          parts: splitSteps(message.parts)
            .filter((step) => !sendsOnlyThinking(step))
            .flat(),
        }
      : message,
  );
