import type { AiUsageKind } from '@repo/ai-database/schema';
import * as z from 'zod/mini';

import {
  addUsageTokens,
  EMPTY_USAGE_TOKENS,
} from '@/features/usage/application/pricing';
import type { UsageTokens } from '@/features/usage/application/pricing';
import {
  recordUsage,
  reserveUsage,
  USAGE_REFUSAL_MESSAGES,
} from '@/features/usage/application/usage';
import { GENERATION_MODELS } from '@/shared/claude/models';

export const artifactToolContextSchema = z.object({
  userId: z.string(),
  threadId: z.string(),
  model: z.enum(GENERATION_MODELS),
});

export type ArtifactToolContext = z.infer<typeof artifactToolContextSchema>;

const MIN_PROGRESS_INTERVAL_MS = 300;
// 送る量が1秒あたりおよそ 20KB で頭打ちになるよう、書きかけが大きいほど間をあける
const PROGRESS_CHARS_PER_MS = 20;
const MAX_SUMMARY_CHARS = 300;

export const progressIntervalMs = (chars: number): number =>
  Math.max(MIN_PROGRESS_INTERVAL_MS, chars / PROGRESS_CHARS_PER_MS);

// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
export const truncateSummary = (text: string): string => {
  const chars = Array.from(text);
  return chars.length <= MAX_SUMMARY_CHARS
    ? text
    : `${chars.slice(0, MAX_SUMMARY_CHARS).join('')}…`;
};

export async function* withReservedUsage<T, R>(
  input: { kind: AiUsageKind; context: ArtifactToolContext },
  run: (onStepUsage: (tokens: UsageTokens) => void) => AsyncGenerator<T, R>,
): AsyncGenerator<T, R> {
  const { context } = input;
  const reservation = await reserveUsage({
    app: 'agent',
    kind: input.kind,
    userId: context.userId,
    model: context.model,
    now: Date.now(),
  });
  if (!reservation.ok) {
    throw new Error(USAGE_REFUSAL_MESSAGES[reservation.reason]);
  }

  let tokens = EMPTY_USAGE_TOKENS;
  try {
    return yield* run((step) => {
      tokens = addUsageTokens(tokens, step);
    });
  } finally {
    // tool が返ったあとの予算の確かめ（stopWhen）に入るよう、after に載せずに書き終えてから返る
    await recordUsage({
      usageId: reservation.usageId,
      model: context.model,
      tokens,
    }).catch((error: unknown) => {
      console.error('利用の記録に失敗しました', error);
    });
  }
}
