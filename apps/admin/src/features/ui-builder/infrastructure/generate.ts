import { type ModelMessage, streamText } from 'ai';

import { buildSystemPrompt } from '../application/prompt';

// 既定は動作実績のある OpenAI provider の上位モデル（AI Gateway の creator/model 形式）。
// admin 配下のオーナー専用・低頻度利用なので gpt-4o-mini より品質を優先する。
// Claude を使いたい場合は AI Gateway にクレジットを追加のうえ
// UI_BUILDER_MODEL=anthropic/claude-sonnet-4.6 のように env で差し替える。
const UI_BUILDER_MODEL = process.env['UI_BUILDER_MODEL'] ?? 'openai/gpt-4.1';

// 1 回の生成コストの上限。複雑な UI でも JSONL が途中で切れないよう余裕を持たせつつ、
// 暴走時の課金は抑える。
const MAX_OUTPUT_TOKENS = 8000;

// システムプロンプトは決定的なので、モジュール読み込み時に一度だけ生成する。
const SYSTEM_PROMPT = buildSystemPrompt();

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * 会話履歴から UI 生成のストリームを返す。
 *
 * レスポンスは「地の文 + JSONL（RFC 6902 JSON Patch）」が混在する素のテキスト
 * ストリームで、これは `@json-render/react` の `useChatUI` がそのまま解釈できる形式。
 *
 * `toTextStreamResponse()` はストリーム途中のエラー（モデル不可・クレジット不足など）を
 * 本文に出さず握り潰すため、画面が真っ白になってしまう。代わりに `fullStream` を自前で
 * 流し、error パートを地の文として書き出すことで、失敗理由を会話に表示する。
 */
export const streamUiBuilder = (messages: ModelMessage[]): Response => {
  const result = streamText({
    model: UI_BUILDER_MODEL,
    system: SYSTEM_PROMPT,
    messages,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const fail = (error: unknown): void => {
        const message = toMessage(error);
        // AI Gateway のキー未設定・モデル不可・クレジット不足・レート超過などはここに出る。
        console.error('AI UIビルダー: 生成に失敗しました:', message);
        controller.enqueue(encoder.encode(`\n生成に失敗しました: ${message}`));
      };

      try {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === 'error') {
            fail(part.error);
          }
        }
      } catch (error) {
        fail(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
