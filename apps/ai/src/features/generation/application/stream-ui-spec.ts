import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import {
  applySpecStreamPatch,
  createMixedStreamParser,
  isNonEmptySpec,
} from '@json-render/core';
import type { Spec } from '@json-render/core';
import { streamText } from 'ai';

import type { UsageTokens } from '@/features/usage/application/pricing';
import { getGenerationModel } from '@/shared/claude/claude-provider';
import type { GenerationModel } from '@/shared/claude/models';

import { buildSpecSystemPrompt } from './build-spec-system-prompt';
import { generationTextOf } from './generation-stream';
import type { GenerationFailure } from './generation-stream';
import type { UiSpecDraft } from './ui-spec';

const failureMessage = (failure: GenerationFailure): string => {
  if (failure.type === 'error') {
    return `UI の生成でエラーが起きました: ${failure.message}`;
  }
  switch (failure.finishReason) {
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

  for await (const part of generationTextOf({
    stream: result.stream,
    abortSignal: input.abortSignal,
    onStepUsage: input.onStepUsage,
    failureMessage,
  })) {
    const appliedBefore = appliedPatchCount;
    if (part.type === 'text-delta') {
      parser.push(part.text);
    } else {
      // 次の text のブロックと行が繋がらないよう、ブロックの終わりで区切る
      parser.flush();
    }
    if (appliedPatchCount !== appliedBefore) {
      yield draft();
    }
  }
  parser.flush();
  return draft();
}
