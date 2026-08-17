import {
  buildUserPrompt,
  isNonEmptySpec,
  pipeJsonRender,
} from '@json-render/core';
import type { Spec } from '@json-render/core';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai';
import type { UIMessage } from 'ai';
import * as z from 'zod/mini';

import { buildSlidesSystemPrompt } from '@/features/generation/application/build-slides-system-prompt';
import { buildSpecSystemPrompt } from '@/features/generation/application/build-spec-system-prompt';
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
  // ui: 編集の土台になる現在の spec / slides: 現在のデッキ Markdown。
  currentSpec: z.optional(z.nullable(z.unknown())),
  currentFile: z.optional(z.nullable(z.string())),
  // ui: 前回生成が検証エラーだったときの修復指示（validateGeneratedSpec の repairPrompt）。
  repairPrompt: z.optional(z.nullable(z.string())),
});

// data-spec 等の data パーツはモデルに渡さない（会話文だけを文脈にする。spec の
// 文脈は最新 spec を buildUserPrompt で最後の user メッセージに埋めて渡す）。
const stripDataParts = (messages: UIMessage[]): UIMessage[] =>
  messages.map((message) => ({
    ...message,
    parts: message.parts.filter((part) => !part.type.startsWith('data-')),
  }));

// 編集ターンでは、最後の user メッセージを json-render 標準の編集プロンプト
// （現在の spec + パッチ編集の指示）で包む。表示用のメッセージはクライアント側の
// 元テキストのまま変わらない。
const withEditContext = (
  messages: UIMessage[],
  currentSpec: Spec | null,
): UIMessage[] => {
  const last = messages.at(-1);
  if (currentSpec === null || last?.role !== 'user') {
    return messages;
  }
  const parts: UIMessage['parts'] = [];
  for (const part of last.parts) {
    parts.push(
      part.type === 'text'
        ? { ...part, text: buildUserPrompt({ prompt: part.text, currentSpec }) }
        : part,
    );
  }
  return [...messages.slice(0, -1), { ...last, parts }];
};

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

  const { messages, model, mode, currentSpec, currentFile, repairPrompt } =
    parsed.data;
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

  const result = streamText({
    model: getFuguModel(model ?? 'fugu'),
    instructions:
      mode === 'slides'
        ? buildSlidesSystemPrompt({ currentSource: currentFile })
        : buildSpecSystemPrompt({ repairPrompt }),
    messages: modelMessages,
    temperature: 0.4,
    maxOutputTokens: 8000,
    maxRetries: 2,
    abortSignal: req.signal,
    onError: ({ error }) => {
      console.error('Fugu 生成エラー', error);
    },
    onEnd: ({ usage }) => {
      // レート制限のカウント源なので利用量を記録する。
      void insertGenerationUsage({
        app,
        userId: session.userId,
        inputTokens: usage.inputTokens ?? null,
        outputTokens: usage.outputTokens ?? null,
      });
    },
  });

  const uiStream = toUIMessageStream({
    stream: result.stream,
    onError: (error) =>
      error instanceof Error ? error.message : '生成中にエラーが発生しました',
  });

  return createUIMessageStreamResponse({
    // ui モードは本文中の JSONL パッチ行を data-spec パーツへ分離する。
    stream: app === 'ui-studio' ? pipeJsonRender(uiStream) : uiStream,
  });
}
