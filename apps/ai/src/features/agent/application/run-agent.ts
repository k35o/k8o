import 'server-only';
import type { AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateId,
  isStepCount,
  JSONParseError,
  streamText,
  toUIMessageStream,
  TypeValidationError,
} from 'ai';
import { after } from 'next/server';

import {
  addUsageTokens,
  EMPTY_USAGE_TOKENS,
  toUsageTokens,
  webSearchesOf,
} from '@/features/usage/application/pricing';
import {
  isMonthlyBudgetExceeded,
  recordUsage,
} from '@/features/usage/application/usage';
import { getGenerationModel } from '@/shared/claude/claude-provider';
import type { GenerationModel } from '@/shared/claude/models';

import type { AgentUIMessage } from './agent-message';
import {
  endOfFinish,
  MAX_OUTPUT_TOKENS,
  MAX_STEPS,
  RUN_TIMEOUT_MS,
  SLIDES_TOOL_TIMEOUT_MS,
  TOOL_TIMEOUT_MS,
  UI_TOOL_TIMEOUT_MS,
  withRunEnd,
} from './agent-run';
import { dropThinkingOnlySteps } from './drop-thinking-only-steps';
import { AGENT_INSTRUCTIONS } from './instructions';
import { watchStopRequest } from './stop-watch';
import { finishRun, recordInputTokens } from './threads';
import { agentTools, WITHHOLDS_OUTPUT } from './tools';
import { withholdToolOutputs } from './withhold-tool-outputs';

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

// 応答のかたまりを SDK が読めなかったときのエラーは、message にかたまりの JSON（web の tool が読んだページの
// 本文や PDF の base64）をまるごと持ち、Node の inspect の深さの上限も効かない。連鎖のどこかにあれば、
// ログには名前と context だけを残す
const loggableErrorOf = (error: unknown): unknown => {
  const names: string[] = [];
  for (
    let current: unknown = error;
    current instanceof Error;
    current = current.cause
  ) {
    names.push(current.name);
    if (TypeValidationError.isInstance(current)) {
      return { names, context: current.context };
    }
    if (JSONParseError.isInstance(current)) {
      return { names };
    }
  }
  return error;
};

export const runAgent = async (input: {
  threadId: string;
  runId: string;
  userId: string;
  usageId: number;
  model: GenerationModel;
  messages: AgentUIMessage[];
}): Promise<Response> => {
  const { threadId, runId, userId, usageId, model, messages } = input;
  const controller = new AbortController();
  const runEnded = new AbortController();
  let usage = EMPTY_USAGE_TOKENS;
  let webSearches = 0;
  let budgetExceeded = false;

  const artifactContext = { userId, threadId, model };
  const result = streamText({
    model: getGenerationModel(model),
    instructions: AGENT_INSTRUCTIONS,
    messages: await convertToModelMessages(dropThinkingOnlySteps(messages), {
      tools: agentTools,
      ignoreIncompleteToolCalls: true,
    }),
    tools: agentTools,
    toolsContext: {
      generate_ui: artifactContext,
      generate_slides: artifactContext,
    },
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
    timeout: {
      totalMs: RUN_TIMEOUT_MS,
      toolMs: TOOL_TIMEOUT_MS,
      tools: {
        generate_uiMs: UI_TOOL_TIMEOUT_MS,
        generate_slidesMs: SLIDES_TOOL_TIMEOUT_MS,
      },
    },
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: { anthropic: ANTHROPIC_OPTIONS },
    // SDK は onStepEnd の例外を握りつぶすので、失敗はここでログに残す
    onStepEnd: async (step) => {
      usage = addUsageTokens(usage, toUsageTokens(step.usage));
      webSearches += webSearchesOf(step.content);
      const inputTransformations =
        step.providerMetadata?.['anthropic']?.['inputTransformations'];
      if (isNonEmptyArray(inputTransformations)) {
        console.error(
          '送り返した thinking が履歴と噛み合わず、Claude API に落とされました',
          inputTransformations,
        );
      }
      await Promise.all([
        recordUsage({ usageId, model, tokens: usage, webSearches }).catch(
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
      console.error('エージェントの生成エラー', loggableErrorOf(error));
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
          assistantMessage: withholdToolOutputs(
            withRunEnd(responseMessage, {
              outcome,
              stopRequested: controller.signal.aborted,
            }),
            WITHHOLDS_OUTPUT,
          ),
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
