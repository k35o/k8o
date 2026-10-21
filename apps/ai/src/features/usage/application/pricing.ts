import type { ContentPart, LanguageModelUsage, ToolSet } from 'ai';

import type { GenerationModel } from '@/shared/claude/models';

type Prices = {
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
};

// 100万トークンあたりのドルは、そのまま1トークンあたりのマイクロドルになるので、換算せずに掛ける
export const PRICE_PER_MTOK_USD = {
  'claude-sonnet-5-5': {
    input: 2,
    output: 10,
    cacheWrite: 2.5,
    cacheRead: 0.2,
  },
  'claude-opus-5-5': { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
} as const satisfies Record<GenerationModel, Prices>;

const WEB_SEARCH_MICRO_USD = 10_000;

// エラーになった検索は課金されないので、結果の届いた検索だけを数える
export const webSearchesOf = (content: Array<ContentPart<ToolSet>>): number =>
  content.filter(
    (part) => part.type === 'tool-result' && part.toolName === 'web_search',
  ).length;

export type UsageTokens = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

export const EMPTY_USAGE_TOKENS: UsageTokens = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
};

export const toUsageTokens = (usage: LanguageModelUsage): UsageTokens => ({
  inputTokens: usage.inputTokens ?? 0,
  outputTokens: usage.outputTokens ?? 0,
  cacheReadTokens: usage.inputTokenDetails.cacheReadTokens ?? 0,
  cacheWriteTokens: usage.inputTokenDetails.cacheWriteTokens ?? 0,
});

export const addUsageTokens = (
  a: UsageTokens,
  b: UsageTokens,
): UsageTokens => ({
  inputTokens: a.inputTokens + b.inputTokens,
  outputTokens: a.outputTokens + b.outputTokens,
  cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
  cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
});

export const costMicroUsd = (
  model: GenerationModel,
  tokens: UsageTokens,
  webSearches: number,
): number => {
  const prices = PRICE_PER_MTOK_USD[model];
  // inputTokens はキャッシュの読み書きを含んだ合計なので、それを除いた分に入力の単価を掛ける
  const uncachedInputTokens =
    tokens.inputTokens - tokens.cacheReadTokens - tokens.cacheWriteTokens;
  return (
    Math.ceil(
      uncachedInputTokens * prices.input +
        tokens.cacheWriteTokens * prices.cacheWrite +
        tokens.cacheReadTokens * prices.cacheRead +
        tokens.outputTokens * prices.output,
    ) +
    webSearches * WEB_SEARCH_MICRO_USD
  );
};
