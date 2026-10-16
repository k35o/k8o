import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

import type { UsageTokens } from '@/features/usage/application/pricing';
import { getGenerationModel } from '@/shared/claude/claude-provider';
import type { GenerationModel } from '@/shared/claude/models';

import { buildSlidesSystemPrompt } from './build-slides-system-prompt';
import { generationTextOf } from './generation-stream';
import type { GenerationFailure } from './generation-stream';

const failureMessage = (failure: GenerationFailure): string => {
  if (failure.type === 'error') {
    return `スライドの生成でエラーが起きました: ${failure.message}`;
  }
  switch (failure.finishReason) {
    case 'length':
      return '出力の上限に達したため、スライドを書ききれませんでした。枚数か内容を減らして頼んでください';
    case 'content-filter':
      return 'Claude がスライドの生成を控えました';
    default:
      return 'スライドの生成が途中で終わりました';
  }
};

export async function* streamSlidesDeck(input: {
  model: GenerationModel;
  userPrompt: string;
  abortSignal: AbortSignal | undefined;
  onStepUsage: (tokens: UsageTokens) => void;
}): AsyncGenerator<string, string> {
  const result = streamText({
    model: getGenerationModel(input.model),
    // 直すときの土台は user の文に置き、system を毎回同じにして cache を読み出せるようにする
    instructions: {
      role: 'system',
      content: buildSlidesSystemPrompt(),
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
      console.error('スライドの生成エラー', error);
    },
  });

  let text = '';
  for await (const part of generationTextOf({
    stream: result.stream,
    abortSignal: input.abortSignal,
    onStepUsage: input.onStepUsage,
    failureMessage,
  })) {
    if (part.type === 'text-delta') {
      text += part.text;
      yield text;
    } else {
      // text のブロックが2つに分かれたとき、デッキの閉じフェンスと meta の開きの行が繋がらないよう区切る
      text += '\n';
    }
  }
  return text;
}
