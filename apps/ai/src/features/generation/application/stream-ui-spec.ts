import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import {
  applySpecStreamPatch,
  createMixedStreamParser,
  isNonEmptySpec,
} from '@json-render/core';
import type { Spec } from '@json-render/core';
import { streamText } from 'ai';
import type { FinishReason, ProviderMetadata } from 'ai';
import * as z from 'zod/mini';

import { toUsageTokens } from '@/features/usage/application/pricing';
import type { UsageTokens } from '@/features/usage/application/pricing';
import { getGenerationModel } from '@/shared/claude/claude-provider';
import type { GenerationModel } from '@/shared/claude/models';

import { buildSpecSystemPrompt } from './build-spec-system-prompt';
import type { UiSpecDraft } from './ui-spec';

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

const unfinishedMessage = (finishReason: FinishReason | undefined): string => {
  switch (finishReason) {
    case 'length':
      return '出力の上限に達したため、UI を組み立てられませんでした。小さく分けて頼んでください';
    case 'content-filter':
      return 'Claude が UI の生成を控えました';
    default:
      return 'UI の生成が途中で終わりました';
  }
};

export async function* streamUiSpec(input: {
  model: GenerationModel;
  base: Spec | null;
  userPrompt: string;
  abortSignal: AbortSignal | undefined;
  onStepUsage: (tokens: UsageTokens) => void;
}): AsyncGenerator<UiSpecDraft, UiSpecDraft> {
  const result = streamText({
    model: getGenerationModel(input.model),
    // 修復の指示は user の文に置き、system を毎回同じにして cache を読み出せるようにする
    instructions: {
      role: 'system',
      content: buildSpecSystemPrompt(),
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
      console.error('UI の生成エラー', error);
    },
  });

  // 土台は DB から読んだ値なので、直接書き換えずに複製へ当てる
  const working: Record<string, unknown> = structuredClone(input.base ?? {});
  let appliedPatchCount = 0;
  const proseLines: string[] = [];
  const parser = createMixedStreamParser({
    onPatch: (patch) => {
      try {
        applySpecStreamPatch(working, patch);
        appliedPatchCount += 1;
      } catch {
        // 当てられないパッチは落として続け、組み上がったかは呼び出し側の検証に任せる
      }
    },
    onText: (line) => {
      proseLines.push(line);
    },
  });
  const draft = (): UiSpecDraft => ({
    spec: isNonEmptySpec(working) ? working : null,
    appliedPatchCount,
    prose: proseLines.join('\n'),
  });

  let finishReason: FinishReason | undefined;
  let streamError: { error: unknown } | null = null;
  let startedUsage: UsageTokens | null = null;
  try {
    for await (const part of result.stream) {
      const appliedBefore = appliedPatchCount;
      switch (part.type) {
        case 'text-delta':
          parser.push(part.text);
          break;
        // 次の text のブロックと行が繋がらないよう、ブロックの終わりで区切る
        case 'text-end':
          parser.flush();
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
      if (appliedPatchCount !== appliedBefore) {
        yield draft();
      }
    }
  } finally {
    if (startedUsage !== null) {
      input.onStepUsage(startedUsage);
    }
  }

  parser.flush();
  // 中断された streamText は例外を投げず、abort のパーツを流して閉じる
  input.abortSignal?.throwIfAborted();
  if (streamError !== null) {
    throw new Error(
      `UI の生成でエラーが起きました: ${describeError(streamError.error)}`,
    );
  }
  if (finishReason !== 'stop') {
    throw new Error(unfinishedMessage(finishReason));
  }
  return draft();
}
