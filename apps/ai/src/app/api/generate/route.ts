import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import * as z from 'zod/mini';

import { buildSlidesSystemPrompt } from '@/features/generation/application/build-slides-system-prompt';
import { buildSystemPrompt } from '@/features/generation/application/build-system-prompt';
import { GENERATION_MODELS } from '@/features/generation/application/models';
import { GENERATION_MODES } from '@/features/generation/application/modes';
import {
  generationLimit,
  isOverLimit,
  windowStartIso,
} from '@/features/generation/application/rate-limit';
import { getFuguModel } from '@/features/generation/infrastructure/fugu-provider';
import {
  countRecentGenerations,
  insertGenerationUsage,
} from '@/features/generation/infrastructure/usage-repository';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

const bodySchema = z.object({
  id: z.optional(z.string()),
  messages: z.array(z.unknown()),
  model: z.optional(z.enum(GENERATION_MODELS)),
  mode: z.optional(z.enum(GENERATION_MODES)),
  currentFile: z.optional(z.nullable(z.string())),
  buildErrors: z.optional(z.nullable(z.string())),
});

export async function POST(req: Request): Promise<Response> {
  // 課金が発生する境界なので、まず認証ゲート（未許可は 401）。middleware は /api を守らない。
  const session = await requireAllowedSession(req.headers);
  if (session === null) {
    return new Response(null, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const { messages, model, mode, currentFile, buildErrors } = parsed.data;
  const app = mode === 'slides' ? ('slides' as const) : ('ui-studio' as const);

  // userId 単位のレート制限（スライディング1時間ウィンドウ）。暴走時のコストを抑える。
  const recent = await countRecentGenerations({
    app,
    userId: session.userId,
    sinceIso: windowStartIso(Date.now()),
  });
  if (isOverLimit(recent, generationLimit())) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // messages の要素形状は z.unknown のまま。壊れた parts/role を SDK 内部例外（500）にせず 400 で弾く。
  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>;
  try {
    modelMessages = await convertToModelMessages(messages as UIMessage[]);
  } catch {
    return new Response(null, { status: 400 });
  }

  const result = streamText({
    model: getFuguModel(model ?? 'fugu'),
    system:
      mode === 'slides'
        ? buildSlidesSystemPrompt({ currentSource: currentFile })
        : buildSystemPrompt({ currentFile, buildErrors }),
    messages: modelMessages,
    temperature: 0.4,
    maxOutputTokens: 8000,
    maxRetries: 2,
    abortSignal: req.signal,
    onError: ({ error }) => {
      console.error('Fugu 生成エラー', error);
    },
    onFinish: ({ usage }) => {
      // レート制限のカウント源なので利用量を記録する。
      void insertGenerationUsage({
        app,
        userId: session.userId,
        inputTokens: usage.inputTokens ?? null,
        outputTokens: usage.outputTokens ?? null,
      });
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error) =>
      error instanceof Error ? error.message : '生成中にエラーが発生しました',
  });
}
