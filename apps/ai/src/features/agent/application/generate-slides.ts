import * as z from 'zod/mini';

import {
  findSlidesVersion,
  saveSlidesVersion,
} from '@/features/artifacts/application/artifacts';
import { parseSlidesGeneration } from '@/features/generation/application/parse-slides-generation';
import {
  settleSlidesDeck,
  slidesUserPrompt,
} from '@/features/generation/application/slides-deck';
import { streamSlidesDeck } from '@/features/generation/application/stream-slides-deck';
import { parseDeck } from '@/features/slides/application/parse-deck';

import {
  progressIntervalMs,
  truncateSummary,
  withReservedUsage,
} from './artifact-tool';
import type { ArtifactToolContext } from './artifact-tool';

export const generateSlidesInputSchema = z.object({
  title: z
    .string()
    .check(
      z.minLength(1),
      z.describe('スライドの短い名前。カードとプレビューの見出しになる'),
    ),
  base: z
    .nullish(
      z.object({
        artifactId: z.string().check(z.describe('直すスライドの artifactId')),
        version: z.int().check(z.positive(), z.describe('土台にする版')),
      }),
    )
    .check(
      z.describe(
        '前に作ったスライドを直すときに、土台にする版を指す。省くと新しいスライドを作る',
      ),
    ),
  instruction: z
    .string()
    .check(
      z.minLength(1),
      z.describe(
        '作るスライド、または直す内容。スライドを書く役はこの会話も記事も読まないので、題材・聞き手・枚数・各スライドの要点・載せるコードなど、書くのに要ることをすべて書く',
      ),
    ),
});

type GenerateSlidesInput = z.infer<typeof generateSlidesInputSchema>;

export type GenerateSlidesOutput =
  | {
      status: 'generating';
      phase: 'thinking' | 'writing';
      source: string | null;
    }
  | {
      status: 'done';
      artifactId: string;
      version: number;
      summary: string;
      source: string;
    };

export async function* generateSlides({
  input,
  context,
  abortSignal,
}: {
  input: GenerateSlidesInput;
  context: ArtifactToolContext;
  abortSignal: AbortSignal | undefined;
}): AsyncGenerator<GenerateSlidesOutput> {
  const target = input.base ?? null;
  const base =
    target === null
      ? null
      : await findSlidesVersion({ ...target, userId: context.userId });
  if (target !== null && base === null) {
    throw new Error(
      `スライドが見つかりません: artifactId ${target.artifactId} の版 ${target.version.toString()}`,
    );
  }
  const baseSource = base?.source ?? null;

  const text = yield* withReservedUsage(
    { kind: 'slides', context },
    async function* (
      onStepUsage,
    ): AsyncGenerator<GenerateSlidesOutput, string> {
      // 直すときも土台は流さない。スライドは全文の置き換えで土台から続かず、止めたときに
      // 保存済みの土台を途中までのものとして見せてしまうため
      yield { status: 'generating', phase: 'thinking', source: null };
      let shown: string | null = null;
      let nextProgressAt = 0;

      const texts = streamSlidesDeck({
        model: context.model,
        userPrompt: slidesUserPrompt({
          instruction: input.instruction,
          base: baseSource,
        }),
        abortSignal,
        onStepUsage,
      });
      let next = await texts.next();
      while (next.done !== true) {
        const now = Date.now();
        // 書き始めたことは間引かずに伝える。ただし、1枚も読めない書き始め（`<Cov` など）は流さない
        if (shown === null || now >= nextProgressAt) {
          const { source } = parseSlidesGeneration(next.value);
          if (
            source !== null &&
            source !== shown &&
            (shown !== null || parseDeck(source).length > 0)
          ) {
            shown = source;
            yield { status: 'generating', phase: 'writing', source };
            nextProgressAt = now + progressIntervalMs(source.length);
          }
        }
        next = await texts.next();
      }
      return next.value;
    },
  );

  const settled = settleSlidesDeck({ text, base: baseSource });
  if (settled.type === 'no-change') {
    throw new Error(
      settled.summary === ''
        ? 'スライドは変わりませんでした'
        : `スライドは変わりませんでした: ${truncateSummary(settled.summary)}`,
    );
  }
  if (settled.type === 'failed') {
    throw new Error(`スライドを読み取れませんでした: ${settled.reason}`);
  }

  // 止めたのに版ができる隙間を狭める
  abortSignal?.throwIfAborted();
  const summary = truncateSummary(settled.summary);
  const saved = await saveSlidesVersion({
    userId: context.userId,
    threadId: context.threadId,
    base,
    title: input.title,
    instruction: input.instruction,
    summary,
    source: settled.source,
  });
  yield {
    status: 'done',
    artifactId: saved.artifactId,
    version: saved.version,
    summary,
    source: settled.source,
  };
}

// ループの中の生の値と、DB から戻した値のどちらでも同じ文を返すよう、input と output だけから決める
export const generateSlidesModelOutput = ({
  input,
  output,
}: {
  input: GenerateSlidesInput;
  output: GenerateSlidesOutput;
}): { type: 'text'; value: string } => ({
  type: 'text',
  value:
    output.status === 'done'
      ? [
          `スライド「${input.title}」を artifactId: ${output.artifactId} の版 ${output.version.toString()} として保存し、利用者の画面のプレビューに出しました。`,
          output.summary,
        ]
          .filter((line) => line !== '')
          .join('\n')
      : 'スライドの生成は完了していません',
});
