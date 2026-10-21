import type { ContentPart, LanguageModelUsage, ToolSet } from 'ai';
import { describe, expect, it } from 'vitest';

import {
  addUsageTokens,
  costMicroUsd,
  EMPTY_USAGE_TOKENS,
  toUsageTokens,
  webSearchesOf,
} from './pricing';
import type { UsageTokens } from './pricing';

const tokens = (overrides: Partial<UsageTokens>): UsageTokens => ({
  ...EMPTY_USAGE_TOKENS,
  ...overrides,
});

const MTOK = 1_000_000;

describe('costMicroUsd', () => {
  describe('正常系', () => {
    it.each([
      ['claude-sonnet-5-5', '入力', tokens({ inputTokens: MTOK }), 2_000_000],
      ['claude-sonnet-5-5', '出力', tokens({ outputTokens: MTOK }), 10_000_000],
      [
        'claude-sonnet-5-5',
        'キャッシュの書き込み',
        tokens({ inputTokens: MTOK, cacheWriteTokens: MTOK }),
        2_500_000,
      ],
      [
        'claude-sonnet-5-5',
        'キャッシュの読み出し',
        tokens({ inputTokens: MTOK, cacheReadTokens: MTOK }),
        200_000,
      ],
      ['claude-opus-5-5', '入力', tokens({ inputTokens: MTOK }), 4_000_000],
      ['claude-opus-5-5', '出力', tokens({ outputTokens: MTOK }), 20_000_000],
      [
        'claude-opus-5-5',
        'キャッシュの書き込み',
        tokens({ inputTokens: MTOK, cacheWriteTokens: MTOK }),
        5_000_000,
      ],
      [
        'claude-opus-5-5',
        'キャッシュの読み出し',
        tokens({ inputTokens: MTOK, cacheReadTokens: MTOK }),
        200_000,
      ],
    ] as const)(
      '%s の%s 100万トークンを、その単価のマイクロドルで数える',
      (model, _kind, usage, expected) => {
        expect(costMicroUsd(model, usage, 0)).toBe(expected);
      },
    );

    it('入力の合計からキャッシュの読み書きを差し引いた分だけに入力の単価を掛け、出力と足し合わせる', () => {
      expect(
        costMicroUsd(
          'claude-sonnet-5-5',
          tokens({
            inputTokens: 10_000,
            cacheReadTokens: 6000,
            cacheWriteTokens: 2000,
            outputTokens: 1000,
          }),
          0,
        ),
      ).toBe(20_200);
    });

    it('web 検索は、1回ごとに 10,000 マイクロドルを足す', () => {
      expect(
        costMicroUsd(
          'claude-sonnet-5-5',
          tokens({ inputTokens: 1000, outputTokens: 100 }),
          3,
        ),
      ).toBe(33_000);
    });
  });

  describe('エッジケース', () => {
    it('1マイクロドルに満たない端数は切り上げる', () => {
      expect(
        costMicroUsd(
          'claude-sonnet-5-5',
          tokens({ inputTokens: 3, cacheReadTokens: 3 }),
          0,
        ),
      ).toBe(1);
    });

    it('トークンが無ければ0円', () => {
      expect(costMicroUsd('claude-opus-5-5', EMPTY_USAGE_TOKENS, 0)).toBe(0);
    });

    it('トークンが無くても、web 検索の代金は数える', () => {
      expect(costMicroUsd('claude-opus-5-5', EMPTY_USAGE_TOKENS, 1)).toBe(
        10_000,
      );
    });
  });
});

describe('webSearchesOf', () => {
  const searchResult = (toolCallId: string): ContentPart<ToolSet> => ({
    type: 'tool-result',
    toolCallId,
    toolName: 'web_search',
    input: { query: 'React 19' },
    output: [],
    providerExecuted: true,
  });

  describe('正常系', () => {
    it('web 検索の回数を、結果の届いた web_search の数で数える', () => {
      expect(
        webSearchesOf([
          { type: 'text', text: '調べます' },
          {
            type: 'tool-call',
            toolCallId: 'srvtoolu_1',
            toolName: 'web_search',
            input: { query: 'React 19' },
            providerExecuted: true,
          },
          searchResult('srvtoolu_1'),
          searchResult('srvtoolu_2'),
        ]),
      ).toBe(2);
    });
  });

  describe('異常系', () => {
    it('エラーで終わった検索と、ほかの tool の結果は数えない', () => {
      expect(
        webSearchesOf([
          {
            type: 'tool-error',
            toolCallId: 'srvtoolu_1',
            toolName: 'web_search',
            input: { query: 'React 19' },
            error: {
              type: 'web_search_tool_result_error',
              errorCode: 'too_many_requests',
            },
            providerExecuted: true,
          },
          {
            type: 'tool-result',
            toolCallId: 'srvtoolu_2',
            toolName: 'web_fetch',
            input: { url: 'https://react.dev/' },
            output: {},
            providerExecuted: true,
          },
          {
            type: 'tool-result',
            toolCallId: 'call-1',
            toolName: 'list_blogs',
            input: {},
            output: { items: [] },
          },
        ]),
      ).toBe(0);
    });
  });
});

describe('toUsageTokens', () => {
  const usage = (overrides: {
    inputTokens?: number;
    outputTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
  }): LanguageModelUsage => ({
    inputTokens: overrides.inputTokens,
    inputTokenDetails: {
      noCacheTokens: undefined,
      cacheReadTokens: overrides.cacheReadTokens,
      cacheWriteTokens: overrides.cacheWriteTokens,
    },
    outputTokens: overrides.outputTokens,
    outputTokenDetails: { textTokens: undefined, reasoningTokens: undefined },
    totalTokens: undefined,
  });

  describe('正常系', () => {
    it('入力の合計・出力・キャッシュの読み出し・書き込みを取り出す', () => {
      expect(
        toUsageTokens(
          usage({
            inputTokens: 1200,
            outputTokens: 300,
            cacheReadTokens: 800,
            cacheWriteTokens: 100,
          }),
        ),
      ).toStrictEqual({
        inputTokens: 1200,
        outputTokens: 300,
        cacheReadTokens: 800,
        cacheWriteTokens: 100,
      });
    });
  });

  describe('エッジケース', () => {
    it('プロバイダが返さなかった値は 0 として数える', () => {
      expect(toUsageTokens(usage({}))).toStrictEqual(EMPTY_USAGE_TOKENS);
    });
  });
});

describe('addUsageTokens', () => {
  describe('正常系', () => {
    it('種類ごとに足し合わせる', () => {
      expect(
        addUsageTokens(
          {
            inputTokens: 100,
            outputTokens: 20,
            cacheReadTokens: 50,
            cacheWriteTokens: 10,
          },
          {
            inputTokens: 300,
            outputTokens: 40,
            cacheReadTokens: 200,
            cacheWriteTokens: 30,
          },
        ),
      ).toStrictEqual({
        inputTokens: 400,
        outputTokens: 60,
        cacheReadTokens: 250,
        cacheWriteTokens: 40,
      });
    });
  });
});
