import { generateText, isStepCount, tool } from 'ai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';

import { getGenerationModel } from '@/shared/claude/claude-provider';

import { webTools } from './web-tools';

vi.mock('server-only', () => ({}));

const claudeMessage = (
  content: unknown[],
  stopReason: 'end_turn' | 'tool_use',
): unknown => ({
  type: 'message',
  id: 'msg_1',
  model: 'claude-sonnet-5-5',
  content,
  stop_reason: stopReason,
  stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 5 },
});

const ANSWER = claudeMessage([{ type: 'text', text: '答え' }], 'end_turn');

// 渡した応答を呼ばれた順に返す Claude API の代役。本番と同じ provider を通して、送った要求の本文を読む
const mockClaudeApi = (...responses: unknown[]): (() => unknown[]) => {
  const fetchMock = vi.fn<typeof fetch>(async () =>
    Response.json(responses.shift()),
  );
  vi.stubGlobal('fetch', fetchMock);
  return () =>
    fetchMock.mock.calls.map(([, init]): unknown => {
      if (typeof init?.body !== 'string') {
        throw new TypeError('Claude API へ文字列の本文を送っていません');
      }
      return JSON.parse(init.body);
    });
};

beforeEach(() => {
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('webTools', () => {
  describe('正常系', () => {
    // 既存のスレッドに残った tool の定義と1字でもずれると、送り返す thinking が落とされる
    it('web_search と web_fetch を、決めた定義（読む URL の出どころを含む）で Claude API に送る', async () => {
      const sentBodies = mockClaudeApi(ANSWER);

      await generateText({
        model: getGenerationModel('claude-sonnet-5-5'),
        tools: webTools,
        prompt: 'React の最新のリリースを調べて',
      });

      const [body] = sentBodies();
      expect(body).toHaveProperty('tools', [
        { type: 'web_search_20250305', name: 'web_search', max_uses: 5 },
        {
          type: 'web_fetch_20250910',
          name: 'web_fetch',
          max_uses: 3,
          max_content_tokens: 30_000,
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
    it('題の無い検索の結果があっても、同じ実行の次のステップへ title を null にして送り返す', async () => {
      const sentBodies = mockClaudeApi(
        claudeMessage(
          [
            {
              type: 'server_tool_use',
              id: 'srvtoolu_1',
              name: 'web_search',
              input: { query: 'k8o' },
            },
            {
              type: 'web_search_tool_result',
              tool_use_id: 'srvtoolu_1',
              content: [
                {
                  type: 'web_search_result',
                  url: 'https://example.com/',
                  title: null,
                  encrypted_content: 'enc',
                  page_age: null,
                },
              ],
            },
            { type: 'tool_use', id: 'toolu_1', name: 'probe', input: {} },
          ],
          'tool_use',
        ),
        ANSWER,
      );

      await generateText({
        model: getGenerationModel('claude-sonnet-5-5'),
        tools: {
          ...webTools,
          probe: tool({
            inputSchema: z.object({}),
            execute: () => '確かめました',
          }),
        },
        stopWhen: isStepCount(2),
        prompt: 'k8o を調べて',
      });

      expect(sentBodies()[1]).toHaveProperty('messages.1.content.1', {
        type: 'web_search_tool_result',
        tool_use_id: 'srvtoolu_1',
        content: [
          {
            type: 'web_search_result',
            url: 'https://example.com/',
            title: null,
            page_age: null,
            encrypted_content: 'enc',
          },
        ],
      });
    });
  });
});
