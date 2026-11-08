import type { InferUITools, UIDataTypes, UIMessage } from 'ai';

import { truncateChars } from '@/shared/truncate-chars';

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
  return truncateChars(text, MAX_TITLE_CHARS);
};
