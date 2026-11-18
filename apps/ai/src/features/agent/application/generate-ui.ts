import type { Spec } from '@json-render/core';
import type * as z from 'zod/mini';

import { streamUiSpec } from '@/features/generation/application/stream-ui-spec';
import {
  settleUiRepair,
  settleUiSpec,
  uiUserPrompt,
} from '@/features/generation/application/ui-spec';
import type { UiSpecDraft } from '@/features/generation/application/ui-spec';

import {
  artifactInputSchema,
  findBase,
  noChangeError,
  progressIntervalMs,
  saveGenerated,
  withReservedUsage,
} from './artifact-tool';
import type { ArtifactToolContext } from './artifact-tool';

export const generateUiInputSchema = artifactInputSchema({
  title: 'UI の短い名前。カードとプレビューの見出しになる',
  baseArtifactId: '直す UI の artifactId',
  base: '前に作った UI を直すときに、土台にする版を指す。省くと新しい UI を作る',
  instruction:
    '作る UI、または直す内容。UI を組む役はこの会話を読まないので、組むのに要ることをすべて書く',
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
  const base = await findBase({
    kind: 'ui',
    target: input.base,
    userId: context.userId,
  });
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
    throw noChangeError('ui', settled.summary);
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

  const saved = await saveGenerated({
    context,
    abortSignal,
    base,
    title: input.title,
    instruction: input.instruction,
    summary: ready.summary,
    content: { kind: 'ui', spec: ready.spec },
  });
  yield { ...saved, spec: ready.spec };
}
