import type {
  FinishReason,
  ProviderMetadata,
  TextStreamPart,
  ToolSet,
} from 'ai';
import * as z from 'zod/mini';

import { toUsageTokens } from '@/features/usage/application/pricing';
import type { UsageTokens } from '@/features/usage/application/pricing';

type GenerationTextPart =
  | { type: 'text-delta'; text: string }
  | { type: 'text-end' };

export type GenerationFailure =
  | { type: 'error'; message: string }
  | { type: 'unfinished'; finishReason: FinishReason | undefined };

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

export async function* generationTextOf<TOOLS extends ToolSet>(input: {
  stream: AsyncIterable<TextStreamPart<TOOLS>>;
  abortSignal: AbortSignal | undefined;
  onStepUsage: (tokens: UsageTokens) => void;
  failureMessage: (failure: GenerationFailure) => string;
}): AsyncGenerator<GenerationTextPart, void> {
  let finishReason: FinishReason | undefined;
  let streamError: { error: unknown } | null = null;
  let startedUsage: UsageTokens | null = null;
  try {
    for await (const part of input.stream) {
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
      input.failureMessage({
        type: 'error',
        message: describeError(streamError.error),
      }),
    );
  }
  if (finishReason !== 'stop') {
    throw new Error(input.failureMessage({ type: 'unfinished', finishReason }));
  }
}
