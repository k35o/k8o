import {
  reserveUsage,
  USAGE_REFUSAL_MESSAGES,
} from '@/features/usage/application/usage';
import { getAllowedSession } from '@/shared/auth/allowed-session';
import {
  DEFAULT_GENERATION_MODEL,
  isGenerationModel,
} from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import { threadTitleFrom } from '../application/agent-message';
import { MAX_CONTEXT_INPUT_TOKENS } from '../application/agent-run';
import { parseChatRequest } from '../application/chat-request';
import { runAgent } from '../application/run-agent';
import {
  appendMessage,
  findThread,
  loadHistory,
  releaseRun,
  startRun,
} from '../application/threads';
import type { ThreadRow } from '../application/threads';

const RUN_IN_PROGRESS_MESSAGE = 'この会話は応答を生成中です';
// 本文が無いと、画面には AI SDK の英語の既定の文言が出る
const UNAUTHORIZED_MESSAGE = 'ログインし直してください';
const INVALID_REQUEST_MESSAGE = '送信内容を読み取れませんでした';
const THREAD_NOT_FOUND_MESSAGE = 'この会話は見つかりません';
const CONTEXT_FULL_MESSAGE =
  'この会話は長くなりすぎました。新しいチャットで続けてください';

// モデルを変えるとキャッシュと送り返す thinking の署名が無効になるので、既存のスレッドでは
// 送られてきた model を使わない
const modelFor = (
  thread: ThreadRow | null,
  requested: GenerationModel | undefined,
): GenerationModel | null => {
  if (thread === null) {
    return requested ?? DEFAULT_GENERATION_MODEL;
  }
  return isGenerationModel(thread.model) ? thread.model : null;
};

export async function handleChat(req: Request): Promise<Response> {
  const session = await getAllowedSession();
  if (session === null) {
    return new Response(UNAUTHORIZED_MESSAGE, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(INVALID_REQUEST_MESSAGE, { status: 400 });
  }
  const request = await parseChatRequest(body);
  if (request === null) {
    return new Response(INVALID_REQUEST_MESSAGE, { status: 400 });
  }

  const thread = await findThread(request.threadId);
  if (thread !== null && thread.userId !== session.userId) {
    return new Response(THREAD_NOT_FOUND_MESSAGE, { status: 404 });
  }
  const model = modelFor(thread, request.model);
  if (model === null) {
    return new Response(INVALID_REQUEST_MESSAGE, { status: 400 });
  }
  if ((thread?.lastInputTokens ?? 0) > MAX_CONTEXT_INPUT_TOKENS) {
    return new Response(CONTEXT_FULL_MESSAGE, { status: 409 });
  }

  const now = Date.now();
  // 断られたときに空のスレッドを残さないよう、スレッドを作る前に予約する
  const reservation = await reserveUsage({
    app: 'agent',
    kind: 'generation',
    userId: session.userId,
    model,
    now,
  });
  if (!reservation.ok) {
    return new Response(USAGE_REFUSAL_MESSAGES[reservation.reason], {
      status: 429,
    });
  }

  const runId = crypto.randomUUID();
  const started = await startRun({
    thread,
    threadId: request.threadId,
    userId: session.userId,
    model,
    title: threadTitleFrom(request.message),
    runId,
    now,
  });
  if (!started) {
    return new Response(RUN_IN_PROGRESS_MESSAGE, { status: 409 });
  }

  try {
    const history = await loadHistory(request.threadId);
    await appendMessage({
      threadId: request.threadId,
      message: request.message,
    });
    return await runAgent({
      threadId: request.threadId,
      runId,
      userId: session.userId,
      usageId: reservation.usageId,
      model,
      messages: [...history, request.message],
    });
  } catch (error) {
    await releaseRun({ threadId: request.threadId, runId });
    throw error;
  }
}
