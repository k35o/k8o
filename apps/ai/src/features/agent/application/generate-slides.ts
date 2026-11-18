import type * as z from 'zod/mini';

import { parseSlidesGeneration } from '@/features/generation/application/parse-slides-generation';
import {
  settleSlidesDeck,
  slidesUserPrompt,
} from '@/features/generation/application/slides-deck';
import { streamSlidesDeck } from '@/features/generation/application/stream-slides-deck';
import { parseDeck } from '@/features/slides/application/parse-deck';

import {
  artifactInputSchema,
  findBase,
  noChangeError,
  progressIntervalMs,
  saveGenerated,
  withReservedUsage,
} from './artifact-tool';
import type { ArtifactToolContext } from './artifact-tool';

export const generateSlidesInputSchema = artifactInputSchema({
  title: 'スライドの短い名前。カードとプレビューの見出しになる',
  baseArtifactId: '直すスライドの artifactId',
  base: '前に作ったスライドを直すときに、土台にする版を指す。省くと新しいスライドを作る',
  instruction:
    '作るスライド、または直す内容。スライドを書く役はこの会話も記事も読まないので、題材・聞き手・枚数・各スライドの要点・載せるコードなど、書くのに要ることをすべて書く',
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
  const base = await findBase({
    kind: 'slides',
    target: input.base,
    userId: context.userId,
  });
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
    throw noChangeError('slides', settled.summary);
  }
  if (settled.type === 'failed') {
    throw new Error(`スライドを読み取れませんでした: ${settled.reason}`);
  }

  const saved = await saveGenerated({
    context,
    abortSignal,
    base,
    title: input.title,
    instruction: input.instruction,
    summary: settled.summary,
    content: { kind: 'slides', source: settled.source },
  });
  yield { ...saved, source: settled.source };
}
