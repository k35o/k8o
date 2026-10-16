import type { Spec } from '@json-render/core';
import * as z from 'zod/mini';

import {
  findUiVersion,
  saveUiVersion,
} from '@/features/artifacts/application/artifacts';
import { streamUiSpec } from '@/features/generation/application/stream-ui-spec';
import {
  settleUiRepair,
  settleUiSpec,
  uiUserPrompt,
} from '@/features/generation/application/ui-spec';
import type { UiSpecDraft } from '@/features/generation/application/ui-spec';

import {
  progressIntervalMs,
  truncateSummary,
  withReservedUsage,
} from './artifact-tool';
import type { ArtifactToolContext } from './artifact-tool';

export const generateUiInputSchema = z.object({
  title: z
    .string()
    .check(
      z.minLength(1),
      z.describe('UI の短い名前。カードとプレビューの見出しになる'),
    ),
  base: z
    .nullish(
      z.object({
        artifactId: z.string().check(z.describe('直す UI の artifactId')),
        version: z.int().check(z.positive(), z.describe('土台にする版')),
      }),
    )
    .check(
      z.describe(
        '前に作った UI を直すときに、土台にする版を指す。省くと新しい UI を作る',
      ),
    ),
  instruction: z
    .string()
    .check(
      z.minLength(1),
      z.describe(
        '作る UI、または直す内容。UI を組む役はこの会話を読まないので、組むのに要ることをすべて書く',
      ),
    ),
});

type GenerateUiInput = z.infer<typeof generateUiInputSchema>;

type GeneratingPhase = 'thinking' | 'drawing' | 'repairing';

export type GenerateUiOutput =
  | { status: 'generating'; phase: GeneratingPhase; spec: Spec | null }
  | {
      status: 'done';
      artifactId: string;
      version: number;
      summary: string;
      spec: Spec;
    };

const specProgressIntervalMs = (spec: Spec | null): number =>
  progressIntervalMs(spec === null ? 0 : JSON.stringify(spec).length);

// SSE に書き出す前や保存したメッセージに載ったあとで組み立て中の spec が書き換わらないよう、複製して流す
const progress = (
  phase: GeneratingPhase,
  spec: Spec | null,
): GenerateUiOutput => ({
  status: 'generating',
  phase,
  spec: spec === null ? null : structuredClone(spec),
});

async function* attempt(input: {
  phase: 'thinking' | 'repairing';
  base: Spec | null;
  userPrompt: string;
  context: ArtifactToolContext;
  abortSignal: AbortSignal | undefined;
}): AsyncGenerator<GenerateUiOutput, UiSpecDraft> {
  return yield* withReservedUsage(
    { kind: 'ui', context: input.context },
    async function* (onStepUsage) {
      let phase: GeneratingPhase = input.phase;
      yield progress(phase, input.base);
      let nextProgressAt = Date.now() + specProgressIntervalMs(input.base);

      const drafts = streamUiSpec({
        model: input.context.model,
        base: input.base,
        userPrompt: input.userPrompt,
        abortSignal: input.abortSignal,
        onStepUsage,
      });
      let next = await drafts.next();
      while (next.done !== true) {
        const now = Date.now();
        // 描き始めたことは間引かずに伝える
        if (phase === 'thinking') {
          phase = 'drawing';
          nextProgressAt = now;
        }
        if (now >= nextProgressAt) {
          yield progress(phase, next.value.spec);
          nextProgressAt = now + specProgressIntervalMs(next.value.spec);
        }
        next = await drafts.next();
      }
      return next.value;
    },
  );
}

export async function* generateUi({
  input,
  context,
  abortSignal,
}: {
  input: GenerateUiInput;
  context: ArtifactToolContext;
  abortSignal: AbortSignal | undefined;
}): AsyncGenerator<GenerateUiOutput> {
  const target = input.base ?? null;
  const base =
    target === null
      ? null
      : await findUiVersion({ ...target, userId: context.userId });
  if (target !== null && base === null) {
    throw new Error(
      `UI が見つかりません: artifactId ${target.artifactId} の版 ${target.version.toString()}`,
    );
  }
  const baseSpec = base?.spec ?? null;

  const first = yield* attempt({
    phase: 'thinking',
    base: baseSpec,
    userPrompt: uiUserPrompt({
      instruction: input.instruction,
      base: baseSpec,
    }),
    context,
    abortSignal,
  });
  const settled = settleUiSpec({
    draft: first,
    base: baseSpec,
    instruction: input.instruction,
  });
  if (settled.type === 'no-change') {
    throw new Error(
      settled.summary === ''
        ? 'UI は変わりませんでした'
        : `UI は変わりませんでした: ${truncateSummary(settled.summary)}`,
    );
  }
  const ready =
    settled.type === 'ready'
      ? settled
      : settleUiRepair({
          repair: settled,
          draft: yield* attempt({
            phase: 'repairing',
            base: settled.base,
            userPrompt: settled.userPrompt,
            context,
            abortSignal,
          }),
          instruction: input.instruction,
        });
  if (ready.type === 'failed') {
    throw new Error(`UI の検証エラーを直せませんでした: ${ready.reason}`);
  }

  // 止めたのに版ができる隙間を狭める
  abortSignal?.throwIfAborted();
  const summary = truncateSummary(ready.summary);
  const saved = await saveUiVersion({
    userId: context.userId,
    threadId: context.threadId,
    base,
    title: input.title,
    instruction: input.instruction,
    summary,
    spec: ready.spec,
  });
  yield {
    status: 'done',
    artifactId: saved.artifactId,
    version: saved.version,
    summary,
    spec: ready.spec,
  };
}

// ループの中の生の値と、DB から戻した値のどちらでも同じ文を返すよう、input と output だけから決める
export const generateUiModelOutput = ({
  input,
  output,
}: {
  input: GenerateUiInput;
  output: GenerateUiOutput;
}): { type: 'text'; value: string } => ({
  type: 'text',
  value:
    output.status === 'done'
      ? [
          `UI「${input.title}」を artifactId: ${output.artifactId} の版 ${output.version.toString()} として保存し、利用者の画面のプレビューに出しました。`,
          output.summary,
        ]
          .filter((line) => line !== '')
          .join('\n')
      : 'UI の生成は完了していません',
});
