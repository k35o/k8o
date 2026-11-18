import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import type { FinishReason, ProviderMetadata } from 'ai';
import * as z from 'zod/mini';

import { toUsageTokens } from '@/features/usage/application/pricing';
import type { UsageTokens } from '@/features/usage/application/pricing';
import { getGenerationModel } from '@/shared/claude/claude-provider';
import type { GenerationModel } from '@/shared/claude/models';

type GenerationTextPart =
  | { type: 'text-delta'; text: string }
  | { type: 'text-end' };

type GenerationMessages = {
  log: string;
  error: string;
  length: string;
  contentFilter: string;
  unfinished: string;
};

const unfinishedMessage = (
  messages: GenerationMessages,
  finishReason: FinishReason | undefined,
): string => {
  switch (finishReason) {
    case 'length':
      return messages.length;
    case 'content-filter':
      return messages.contentFilter;
    default:
      return messages.unfinished;
  }
};

const messageStartUsageSchema = z.object({
  input_tokens: z.number(),
  cache_read_input_tokens: z.nullish(z.number()),
  cache_creation_input_tokens: z.nullish(z.number()),
});

// 中断したステップには finish-step が流れず usage を取れないので、message_start が持つ入力の分を数える
const startedUsageOf = (
  metadata: ProviderMetadata | undefined,
): UsageTokens | null => {
  const parsed = messageStartUsageSchema.safeParse(
    metadata?.['anthropic']?.['usage'],
  );
  if (!parsed.success) {
    return null;
  }
  const cacheReadTokens = parsed.data.cache_read_input_tokens ?? 0;
  const cacheWriteTokens = parsed.data.cache_creation_input_tokens ?? 0;
  return {
    inputTokens: parsed.data.input_tokens + cacheReadTokens + cacheWriteTokens,
    outputTokens: 0,
    cacheReadTokens,
    cacheWriteTokens,
  };
};

const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : JSON.stringify(error);
};

export async function* streamGenerationText(input: {
  model: GenerationModel;
  system: string;
  userPrompt: string;
  abortSignal: AbortSignal | undefined;
  onStepUsage: (tokens: UsageTokens) => void;
  messages: GenerationMessages;
}): AsyncGenerator<GenerationTextPart, void> {
  const result = streamText({
    model: getGenerationModel(input.model),
    // 呼び出しごとに変わる指示は user の文に置き、system を毎回同じにして cache を読み出せるようにする
    instructions: {
      role: 'system',
      content: input.system,
      providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } },
    },
    prompt: input.userPrompt,
    // thinking のトークンも上限に数えるため、生成物の分より大きく取る
    maxOutputTokens: 16_000,
    maxRetries: 2,
    providerOptions: {
      anthropic: {
        effort: 'medium',
        fallbacks: 'default',
      } satisfies AnthropicLanguageModelOptions,
    },
    ...(input.abortSignal === undefined
      ? {}
      : { abortSignal: input.abortSignal }),
    onError: ({ error }) => {
      console.error(input.messages.log, error);
    },
  });

  let finishReason: FinishReason | undefined;
  let streamError: { error: unknown } | null = null;
  let startedUsage: UsageTokens | null = null;
  try {
    for await (const part of result.stream) {
      switch (part.type) {
        case 'text-delta':
          yield { type: 'text-delta', text: part.text };
          break;
        case 'text-end':
          yield { type: 'text-end' };
          break;
        case 'custom':
          if (part.kind === 'anthropic.message_start') {
            startedUsage = startedUsageOf(part.providerMetadata);
          }
          break;
        // エラーで終わったステップは入力トークン数を持たないので、message_start の分を残す
        case 'finish-step':
          if (part.usage.inputTokens !== undefined) {
            input.onStepUsage(toUsageTokens(part.usage));
            startedUsage = null;
          }
          break;
        // エラーのあとの finish-step まで読んで usage を受け取ってから投げる
        case 'error':
          streamError ??= { error: part.error };
          break;
        case 'finish':
          finishReason = part.finishReason;
          break;
        default:
          break;
      }
    }
  } finally {
    if (startedUsage !== null) {
      input.onStepUsage(startedUsage);
    }
  }

  // 中断された streamText は例外を投げず、abort のパーツを流して閉じる
  input.abortSignal?.throwIfAborted();
  if (streamError !== null) {
    throw new Error(
      `${input.messages.error}: ${describeError(streamError.error)}`,
    );
  }
  if (finishReason !== 'stop') {
    throw new Error(unfinishedMessage(input.messages, finishReason));
  }
}
