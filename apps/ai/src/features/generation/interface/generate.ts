import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import { isNonEmptySpec, pipeJsonRender } from '@json-render/core';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai';
import type { UIMessage } from 'ai';
import { after } from 'next/server';
import * as z from 'zod/mini';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { buildSlidesSystemPrompt } from '../application/build-slides-system-prompt';
import { buildSpecSystemPrompt } from '../application/build-spec-system-prompt';
import {
  DEFAULT_GENERATION_MODEL,
  GENERATION_MODELS,
} from '../application/models';
import { GENERATION_MODES } from '../application/modes';
import {
  stripDataParts,
  withEditContext,
} from '../application/prompt-messages';
import { generationLimit, windowStartIso } from '../application/rate-limit';
import { sumStepTokens } from '../application/step-tokens';
import type { StepUsage } from '../application/step-tokens';
import { getGenerationModel } from '../infrastructure/claude-provider';
import {
  reserveGenerationUsage,
  updateGenerationUsageTokens,
} from '../infrastructure/usage-repository';

const bodySchema = z.object({
  id: z.optional(z.string()),
  messages: z.array(z.unknown()),
  model: z.optional(z.enum(GENERATION_MODELS)),
  mode: z.optional(z.enum(GENERATION_MODES)),
  // ui: 編集の土台になる現在の spec / slides: 現在のデッキ Markdown。
  currentSpec: z.optional(z.nullable(z.unknown())),
  currentFile: z.optional(z.nullable(z.string())),
  // ui: 前回生成が検証エラーだったときの修復指示（validateGeneratedSpec の repairPrompt）。
  repairPrompt: z.optional(z.nullable(z.string())),
});

export async function handleGenerate(req: Request): Promise<Response> {
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

  const { messages, model, mode, currentSpec, currentFile, repairPrompt } =
    parsed.data;
  const app = mode === 'slides' ? ('slides' as const) : ('ui-studio' as const);

  const editBase = isNonEmptySpec(currentSpec) ? currentSpec : null;
  const uiMessages =
    app === 'ui-studio'
      ? withEditContext(stripDataParts(messages as UIMessage[]), editBase)
      : (messages as UIMessage[]);

  // messages の要素形状は z.unknown のまま。壊れた parts/role を SDK 内部例外（500）にせず 400 で弾く。
  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>;
  try {
    modelMessages = await convertToModelMessages(uiMessages);
  } catch {
    return new Response(null, { status: 400 });
  }

  // userId 単位のレート制限（スライディング1時間ウィンドウ）。暴走時のコストを抑える。
  // 中断した生成も数えるよう、Claude を呼ぶ前に利用の行を予約する
  const now = Date.now();
  const usageId = await reserveGenerationUsage({
    app,
    userId: session.userId,
    createdAt: new Date(now).toISOString(),
    sinceIso: windowStartIso(now),
    limit: generationLimit(),
  });
  if (usageId === null) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // onAbort には終わったステップしか渡らないので、onEnd もステップから数えて同じ処理にする。
  // 応答を返したあとに関数が止まっても書き込みが欠けないよう after に載せる
  const recordTokens = ({ steps }: { steps: readonly StepUsage[] }): void => {
    after(
      updateGenerationUsageTokens({ id: usageId, ...sumStepTokens(steps) }),
    );
  };

  const result = streamText({
    model: getGenerationModel(model ?? DEFAULT_GENERATION_MODEL),
    instructions:
      mode === 'slides'
        ? buildSlidesSystemPrompt({ currentSource: currentFile })
        : buildSpecSystemPrompt({ repairPrompt }),
    messages: modelMessages,
    // thinking のトークンも上限に数えるため、生成物の分より大きく取る
    maxOutputTokens: 16_000,
    maxRetries: 2,
    providerOptions: {
      // 誤って拒否されたとき、拒否の種類によっては Claude API 側で別のモデルに切り替えて答えさせる
      anthropic: {
        effort: 'medium',
        fallbacks: 'default',
      } satisfies AnthropicLanguageModelOptions,
    },
    abortSignal: req.signal,
    onError: ({ error }) => {
      console.error('生成エラー', error);
    },
    onEnd: recordTokens,
    onAbort: recordTokens,
  });

  const uiStream = toUIMessageStream({
    stream: result.stream,
    // thinking は署名付きでクライアントの履歴に残り、次のターンで送り返される。この画面は
    // system と前ターンの user を毎ターン作り直すので、送り返した thinking は API に 400 で
    // 拒否される。画面にも出していないので、クライアントへ送らない
    sendReasoning: false,
    onError: (error) =>
      error instanceof Error ? error.message : '生成中にエラーが発生しました',
  });

  return createUIMessageStreamResponse({
    // ui モードは本文中の JSONL パッチ行を data-spec パーツへ分離する。
    stream: app === 'ui-studio' ? pipeJsonRender(uiStream) : uiStream,
  });
}
