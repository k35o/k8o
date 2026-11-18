import {
  applySpecStreamPatch,
  createMixedStreamParser,
  isNonEmptySpec,
} from '@json-render/core';
import type { Spec } from '@json-render/core';

import type { UsageTokens } from '@/features/usage/application/pricing';
import type { GenerationModel } from '@/shared/claude/models';

import { buildSpecSystemPrompt } from './build-spec-system-prompt';
import { streamGenerationText } from './generation-stream';
import type { UiSpecDraft } from './ui-spec';

const MESSAGES = {
  log: 'UI の生成エラー',
  error: 'UI の生成でエラーが起きました',
  length:
    '出力の上限に達したため、UI を組み立てられませんでした。小さく分けて頼んでください',
  contentFilter: 'Claude が UI の生成を控えました',
  unfinished: 'UI の生成が途中で終わりました',
};

export async function* streamUiSpec(input: {
  model: GenerationModel;
  base: Spec | null;
  userPrompt: string;
  abortSignal: AbortSignal | undefined;
  onStepUsage: (tokens: UsageTokens) => void;
}): AsyncGenerator<UiSpecDraft, UiSpecDraft> {
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

  for await (const part of streamGenerationText({
    model: input.model,
    system: buildSpecSystemPrompt(),
    userPrompt: input.userPrompt,
    abortSignal: input.abortSignal,
    onStepUsage: input.onStepUsage,
    messages: MESSAGES,
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
