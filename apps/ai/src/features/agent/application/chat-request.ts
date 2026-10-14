import { safeValidateUIMessages } from 'ai';
import * as z from 'zod/mini';

import { GENERATION_MODELS } from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import type { AgentUIMessage } from './agent-message';

const bodySchema = z.object({
  threadId: z.uuid(),
  // regenerate は履歴の編集になるので受けない
  trigger: z.literal('submit-message'),
  model: z.optional(z.enum(GENERATION_MODELS)),
  message: z.unknown(),
});

export type ChatRequest = {
  threadId: string;
  model: GenerationModel | undefined;
  message: AgentUIMessage;
};

const textOf = (message: AgentUIMessage): string | null => {
  const texts: string[] = [];
  for (const part of message.parts) {
    if (part.type !== 'text') {
      return null;
    }
    texts.push(part.text);
  }
  return texts.join('\n');
};

export const parseChatRequest = async (
  body: unknown,
): Promise<ChatRequest | null> => {
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return null;
  }
  const validated = await safeValidateUIMessages<AgentUIMessage>({
    messages: [parsed.data.message],
  });
  if (!validated.success) {
    return null;
  }
  const [message] = validated.data;
  if (message?.role !== 'user') {
    return null;
  }
  const text = textOf(message);
  if (text === null || text.trim() === '') {
    return null;
  }
  return {
    threadId: parsed.data.threadId,
    model: parsed.data.model,
    // 履歴はそのまま毎ターン送り直すので、クライアントが付けた part の状態や metadata を
    // 残さないよう、本文だけから組み直す
    message: { id: message.id, role: 'user', parts: [{ type: 'text', text }] },
  };
};
