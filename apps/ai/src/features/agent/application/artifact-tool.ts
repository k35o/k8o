import type { AiUsageKind } from '@repo/ai-database/schema';
import * as z from 'zod/mini';

import type {
  ArtifactContent,
  ArtifactKind,
} from '@/features/artifacts/application/artifact-kind';
import {
  findArtifactVersion,
  saveArtifactVersion,
} from '@/features/artifacts/application/artifacts';
import type { StoredArtifactVersion } from '@/features/artifacts/application/artifacts';
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
import { truncateChars } from '@/shared/truncate-chars';

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

const truncateSummary = (text: string): string =>
  truncateChars(text, MAX_SUMMARY_CHARS);

// Claude に返す文に入るので、画面のラベル（ARTIFACT_KIND_LABELS）を変えても変わらないよう別に持つ
const NAMES = {
  ui: 'UI',
  slides: 'スライド',
} as const satisfies Record<ArtifactKind, string>;

// 英字で終わる語のあとだけ、助詞との間をあける
const SUBJECTS = {
  ui: 'UI ',
  slides: 'スライド',
} as const satisfies Record<ArtifactKind, string>;

type ArtifactInputSchema = z.ZodMiniObject<{
  title: z.ZodMiniString;
  base: z.ZodMiniOptional<
    z.ZodMiniNullable<
      z.ZodMiniObject<{
        artifactId: z.ZodMiniString;
        version: z.ZodMiniNumberFormat;
      }>
    >
  >;
  instruction: z.ZodMiniString;
}>;

export const artifactInputSchema = (describe: {
  title: string;
  baseArtifactId: string;
  base: string;
  instruction: string;
}): ArtifactInputSchema =>
  z.object({
    title: z.string().check(z.minLength(1), z.describe(describe.title)),
    base: z
      .nullish(
        z.object({
          artifactId: z.string().check(z.describe(describe.baseArtifactId)),
          version: z.int().check(z.positive(), z.describe('土台にする版')),
        }),
      )
      .check(z.describe(describe.base)),
    instruction: z
      .string()
      .check(z.minLength(1), z.describe(describe.instruction)),
  });

type ArtifactToolInput = z.infer<ArtifactInputSchema>;

export const findBase = async <Kind extends ArtifactKind>(input: {
  kind: Kind;
  target: ArtifactToolInput['base'];
  userId: string;
}): Promise<StoredArtifactVersion<Kind> | null> => {
  const target = input.target ?? null;
  if (target === null) {
    return null;
  }
  const base = await findArtifactVersion({
    ...target,
    kind: input.kind,
    userId: input.userId,
  });
  if (base === null) {
    throw new Error(
      `${SUBJECTS[input.kind]}が見つかりません: artifactId ${target.artifactId} の版 ${target.version.toString()}`,
    );
  }
  return base;
};

export const noChangeError = (kind: ArtifactKind, summary: string): Error =>
  new Error(
    summary === ''
      ? `${SUBJECTS[kind]}は変わりませんでした`
      : `${SUBJECTS[kind]}は変わりませんでした: ${truncateSummary(summary)}`,
  );

type SavedArtifact = {
  status: 'done';
  artifactId: string;
  version: number;
  summary: string;
};

export const saveGenerated = async (input: {
  context: ArtifactToolContext;
  abortSignal: AbortSignal | undefined;
  base: StoredArtifactVersion<ArtifactKind> | null;
  title: string;
  instruction: string;
  summary: string;
  content: ArtifactContent;
}): Promise<SavedArtifact> => {
  // 止めたのに版ができる隙間を狭める
  input.abortSignal?.throwIfAborted();
  const summary = truncateSummary(input.summary);
  const saved = await saveArtifactVersion({
    userId: input.context.userId,
    threadId: input.context.threadId,
    base: input.base,
    title: input.title,
    instruction: input.instruction,
    summary,
    content: input.content,
  });
  return {
    status: 'done',
    artifactId: saved.artifactId,
    version: saved.version,
    summary,
  };
};

// ループの中の生の値と、DB から戻した値のどちらでも同じ文を返すよう、input と output だけから決める
export const artifactModelOutput = (
  kind: ArtifactKind,
  {
    input,
    output,
  }: {
    input: Pick<ArtifactToolInput, 'title'>;
    output: SavedArtifact | { status: 'generating' };
  },
): { type: 'text'; value: string } => ({
  type: 'text',
  value:
    output.status === 'done'
      ? [
          `${NAMES[kind]}「${input.title}」を artifactId: ${output.artifactId} の版 ${output.version.toString()} として保存し、利用者の画面のプレビューに出しました。`,
          output.summary,
        ]
          .filter((line) => line !== '')
          .join('\n')
      : `${SUBJECTS[kind]}の生成は完了していません`,
});

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
      webSearches: 0,
    }).catch((error: unknown) => {
      console.error('利用の記録に失敗しました', error);
    });
  }
}
