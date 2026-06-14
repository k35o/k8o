import { arteOdysseyRules, catalog } from '@k8o/arte-odyssey/json-render';

/**
 * チャットで UI を生成するときの追加ルール。
 * `catalog.prompt()` 本文（UI を JSONL パッチで出力する指示）に追記される。
 *
 * - 地の文（JSON ではない普通の文）と JSONL パッチが混在しても、クライアント側の
 *   `useChatUI` が `createMixedStreamParser` で振り分けるため、会話としての一言を
 *   添えてよい。
 */
const chatRules = [
  '最初に1行だけ、何を作ったか・どう変更したかを日本語の地の文（JSON ではない普通の文）で簡潔に述べてから、UI の JSONL パッチを出力すること。',
  'ユーザーが既存の UI への修正を依頼したら、会話の文脈をもとに UI 全体を作り直してよい。',
  'ユーザーの依頼が UI の生成と無関係な場合は、UI を出力せず地の文だけで簡潔に応答すること。',
] as const;

/**
 * json-render 用のシステムプロンプトを生成する（サーバー安全 / React 非依存）。
 *
 * arteOdysseyRules（Table のセル数を columns に揃える・href の形式・Tabs/Accordion の
 * content はテキストのみ等、LLM が破りやすい横断ルール）に加え、チャット向けの
 * ルールを注入する。
 */
export const buildSystemPrompt = (): string =>
  catalog.prompt({ customRules: [...arteOdysseyRules, ...chatRules] });
