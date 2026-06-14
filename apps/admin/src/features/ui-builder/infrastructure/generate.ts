import { type ModelMessage, streamText } from 'ai';

import { buildSystemPrompt } from '../application/prompt';

// 安価モデルを既定にし、env で差し替え可能にする（AI Gateway の creator/model 形式）。
// UI 生成は構造化出力なので、品質を上げたいときは UI_BUILDER_MODEL で上位モデルに切り替える。
const UI_BUILDER_MODEL =
  process.env['UI_BUILDER_MODEL'] ?? 'openai/gpt-4o-mini';

// 1 回の生成コストの上限。spec は大きくないので、これで暴走時の課金を抑える。
const MAX_OUTPUT_TOKENS = 4000;

// システムプロンプトは決定的なので、モジュール読み込み時に一度だけ生成する。
const SYSTEM_PROMPT = buildSystemPrompt();

/**
 * 会話履歴から UI 生成のストリームを返す。
 *
 * レスポンスは「地の文 + JSONL（RFC 6902 JSON Patch）」が混在する素のテキスト
 * ストリームで、これは `@json-render/react` の `useChatUI` がそのまま解釈できる形式。
 */
export const streamUiBuilder = (messages: ModelMessage[]): Response => {
  const result = streamText({
    model: UI_BUILDER_MODEL,
    system: SYSTEM_PROMPT,
    messages,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    onError: ({ error }) => {
      // AI Gateway のキー未設定・モデル不可・レート超過などはここに出る。
      console.error('AI UIビルダー: 生成に失敗しました', error);
    },
  });
  return result.toTextStreamResponse();
};
