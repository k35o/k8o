import type { UsageTokens } from '@/features/usage/application/pricing';
import type { GenerationModel } from '@/shared/claude/models';

import { buildSlidesSystemPrompt } from './build-slides-system-prompt';
import { streamGenerationText } from './generation-stream';

const MESSAGES = {
  log: 'スライドの生成エラー',
  error: 'スライドの生成でエラーが起きました',
  length:
    '出力の上限に達したため、スライドを書ききれませんでした。枚数か内容を減らして頼んでください',
  contentFilter: 'Claude がスライドの生成を控えました',
  unfinished: 'スライドの生成が途中で終わりました',
};

export async function* streamSlidesDeck(input: {
  model: GenerationModel;
  userPrompt: string;
  abortSignal: AbortSignal | undefined;
  onStepUsage: (tokens: UsageTokens) => void;
}): AsyncGenerator<string, string> {
  let text = '';
  for await (const part of streamGenerationText({
    model: input.model,
    system: buildSlidesSystemPrompt(),
    userPrompt: input.userPrompt,
    abortSignal: input.abortSignal,
    onStepUsage: input.onStepUsage,
    messages: MESSAGES,
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
