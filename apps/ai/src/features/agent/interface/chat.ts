import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateId,
  isStepCount,
  streamText,
  toUIMessageStream,
} from 'ai';
import { after } from 'next/server';

import {
  addUsageTokens,
  EMPTY_USAGE_TOKENS,
  toUsageTokens,
} from '@/features/usage/application/pricing';
import {
  isMonthlyBudgetExceeded,
  recordUsage,
  reserveUsage,
  USAGE_REFUSAL_MESSAGES,
} from '@/features/usage/application/usage';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';
import { getGenerationModel } from '@/shared/claude/claude-provider';
import {
  DEFAULT_GENERATION_MODEL,
  isGenerationModel,
} from '@/shared/claude/models';
import type { GenerationModel } from '@/shared/claude/models';

import { threadTitleFrom } from '../application/agent-message';
import type { AgentUIMessage } from '../application/agent-message';
import {
  endOfFinish,
  MAX_CONTEXT_INPUT_TOKENS,
  MAX_OUTPUT_TOKENS,
  MAX_STEPS,
  RUN_TIMEOUT_MS,
  TOOL_TIMEOUT_MS,
  withRunEnd,
} from '../application/agent-run';
import { parseChatRequest } from '../application/chat-request';
import { AGENT_INSTRUCTIONS } from '../application/instructions';
import { watchStopRequest } from '../application/stop-watch';
import {
  appendMessage,
  findThread,
  finishRun,
  loadHistory,
  recordInputTokens,
  releaseRun,
  startRun,
} from '../application/threads';
import type { ThreadRow } from '../application/threads';
import { agentTools } from '../application/tools';

const RUN_IN_PROGRESS_MESSAGE = 'この会話は応答を生成中です';
// 本文が無いと、画面には AI SDK の英語の既定の文言が出る
const UNAUTHORIZED_MESSAGE = 'ログインし直してください';
const INVALID_REQUEST_MESSAGE = '送信内容を読み取れませんでした';
const THREAD_NOT_FOUND_MESSAGE = 'この会話は見つかりません';
const CONTEXT_FULL_MESSAGE =
  'この会話は長くなりすぎました。新しいチャットで続けてください';

const logFailure =
  (message: string) =>
  (error: unknown): void => {
    console.error(message, error);
  };

const ANTHROPIC_OPTIONS = {
  cacheControl: { type: 'ephemeral' },
  effort: 'medium',
  // system や tools を変えたあとも既存のスレッドを続けられるよう、噛み合わない thinking は
  // 400 にせず落とさせる
  thinking: {
    type: 'adaptive',
    display: 'summarized',
    blockBinding: { prefixMismatchBehavior: 'drop_block' },
  },
} satisfies AnthropicLanguageModelOptions;

const isNonEmptyArray = (value: unknown): boolean =>
  Array.isArray(value) && value.length > 0;

// ai が export していない @ai-sdk/provider の getErrorMessage の写し。ループの中で Claude に送る
// tool のエラー文はこれで作られ、保存する文字列がずれると次のターンで送り返す履歴が食い違う
const errorMessageOf = (error: unknown): string => {
  if (error === null || error === undefined) {
    return 'unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.toString();
  }
  return JSON.stringify(error);
};

const streamRun = async (input: {
  threadId: string;
  runId: string;
  usageId: number;
  model: GenerationModel;
  messages: AgentUIMessage[];
}): Promise<Response> => {
  const { threadId, runId, usageId, model, messages } = input;
  const controller = new AbortController();
  const runEnded = new AbortController();
  let usage = EMPTY_USAGE_TOKENS;
  let budgetExceeded = false;

  const result = streamText({
    model: getGenerationModel(model),
    instructions: AGENT_INSTRUCTIONS,
    messages: await convertToModelMessages(messages, {
      tools: agentTools,
      ignoreIncompleteToolCalls: true,
    }),
    tools: agentTools,
    stopWhen: [
      isStepCount(MAX_STEPS),
      async () => {
        budgetExceeded = await isMonthlyBudgetExceeded(Date.now()).catch(
          (error: unknown) => {
            // 予約の時点で予算は確かめているので、読めなければ続ける
            console.error('月の予算を確かめられませんでした', error);
            return false;
          },
        );
        return budgetExceeded;
      },
    ],
    // req.signal を渡すと切断でも止まるので、利用者の停止だけを受けるシグナルを渡す
    abortSignal: controller.signal,
    timeout: { totalMs: RUN_TIMEOUT_MS, toolMs: TOOL_TIMEOUT_MS },
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: { anthropic: ANTHROPIC_OPTIONS },
    // SDK は onStepEnd の例外を握りつぶすので、失敗はここでログに残す
    onStepEnd: async (step) => {
      usage = addUsageTokens(usage, toUsageTokens(step.usage));
      const inputTransformations =
        step.providerMetadata?.['anthropic']?.['inputTransformations'];
      if (isNonEmptyArray(inputTransformations)) {
        console.error(
          '送り返した thinking が履歴と噛み合わず、Claude API に落とされました',
          inputTransformations,
        );
      }
      await Promise.all([
        recordUsage({ usageId, model, tokens: usage }).catch(
          logFailure('利用の記録に失敗しました'),
        ),
        // エラーで終わったステップには入力トークン数が無いので、前の値を残す
        step.usage.inputTokens === undefined
          ? undefined
          : recordInputTokens({
              threadId,
              inputTokens: step.usage.inputTokens,
            }).catch(logFailure('入力トークン数の記録に失敗しました')),
      ]);
    },
    onError: ({ error }) => {
      console.error('エージェントの生成エラー', error);
    },
  });

  const response = createUIMessageStreamResponse({
    stream: toUIMessageStream<typeof agentTools, AgentUIMessage>({
      stream: result.stream,
      tools: agentTools,
      originalMessages: messages,
      generateMessageId: generateId,
      // error のあとに finish が来ると outcome は completed に戻るので、終わり方は finish の
      // finishReason から決める
      messageMetadata: ({ part }) =>
        part.type === 'finish'
          ? { end: endOfFinish(part.finishReason, budgetExceeded) }
          : undefined,
      onError: errorMessageOf,
      onEnd: async ({ responseMessage, outcome }) => {
        runEnded.abort();
        await finishRun({
          threadId,
          runId,
          assistantMessage: withRunEnd(responseMessage, {
            outcome,
            stopRequested: controller.signal.aborted,
          }),
        });
      },
    }),
    // 読み手が切断しても、複製したもう片方を最後まで読み、onEnd で返答を保存させる
    consumeSseStream: ({ stream }) => {
      after(
        consumeStream({
          stream,
          onError: logFailure('応答のストリームが失敗しました'),
        }),
      );
    },
  });

  // ここより前で例外が出たときに監視が残らないよう、Response を返す直前に始める
  watchStopRequest({
    threadId,
    runId,
    signal: runEnded.signal,
    onStop: () => {
      controller.abort();
    },
  });
  return response;
};

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
  const session = await requireAllowedSession(req.headers);
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
    return await streamRun({
      threadId: request.threadId,
      runId,
      usageId: reservation.usageId,
      model,
      messages: [...history, request.message],
    });
  } catch (error) {
    await releaseRun({ threadId: request.threadId, runId });
    throw error;
  }
}
