import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { generateText, tool } from 'ai';
import type { LanguageModel, ToolSet } from 'ai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';

import { getGenerationModel } from './claude-provider';

vi.mock('server-only', () => ({}));

const answer = {
  type: 'message',
  id: 'msg_1',
  model: 'claude-sonnet-5-5',
  content: [{ type: 'text', text: '答え' }],
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 5 },
};

// Claude API へ送った要求の URL と、文字列のままの本文
const sendThrough = async (
  model: LanguageModel,
  tools: ToolSet,
): Promise<{ url: unknown; body: string }> => {
  vi.mocked(fetch).mockClear();
  await generateText({ model, tools, prompt: '調べて' });
  const [url, init] = vi.mocked(fetch).mock.calls[0] ?? [];
  if (typeof init?.body !== 'string') {
    throw new TypeError('Claude API へ文字列の本文を送っていません');
  }
  return { url, body: init.body };
};

beforeEach(() => {
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async () => Response.json(answer)),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('getGenerationModel', () => {
  describe('正常系', () => {
    it('web_fetch の定義に、読む URL の出どころ（利用者のメッセージと web_search の結果だけ）を足して Claude API に送る', async () => {
      const { url, body } = await sendThrough(
        getGenerationModel('claude-sonnet-5-5'),
        {
          web_search: anthropic.tools.webSearch_20250305(),
          web_fetch: anthropic.tools.webFetch_20250910(),
        },
      );

      expect(url).toBe('https://api.anthropic.com/v1/messages');
      expect(JSON.parse(body)).toHaveProperty('tools', [
        { type: 'web_search_20250305', name: 'web_search' },
        {
          type: 'web_fetch_20250910',
          name: 'web_fetch',
          url_sources: {
            user_input: { type: 'all' },
            client_tool_results: { type: 'none' },
            server_tool_results: {
              type: 'only',
              tools: [{ type: 'tool_reference', name: 'web_search' }],
            },
          },
        },
      ]);
    });
  });

  describe('エッジケース', () => {
    it.each([
      [
        'client の tool だけの要求',
        { probe: tool({ inputSchema: z.object({}) }) },
      ],
      ['tool の無い要求（生成の要求）', {}],
    ] satisfies Array<[string, ToolSet]>)(
      '%sの本文は、@ai-sdk/anthropic が組んだまま送る',
      async (_kind, tools) => {
        const sent = await sendThrough(
          getGenerationModel('claude-sonnet-5-5'),
          tools,
        );
        const built = await sendThrough(
          createAnthropic()('claude-sonnet-5-5'),
          tools,
        );

        expect(sent.body).toBe(built.body);
      },
    );
  });
});
