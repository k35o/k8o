import { convertArrayToReadableStream, MockLanguageModelV4 } from 'ai/test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UsageTokens } from '@/features/usage/application/pricing';
import { getGenerationModel } from '@/shared/claude/claude-provider';

import { buildSlidesSystemPrompt } from './build-slides-system-prompt';
import { streamSlidesDeck } from './stream-slides-deck';

vi.mock('@/shared/claude/claude-provider', () => ({
  getGenerationModel: vi.fn(),
}));

type LanguageModelV4StreamPart =
  Awaited<
    ReturnType<MockLanguageModelV4['doStream']>
  >['stream'] extends ReadableStream<infer PART>
    ? PART
    : never;

// 入力 1000（うちキャッシュの読み出し 800・書き込み 100）、出力 200
const finishUsage = {
  inputTokens: { total: 1000, noCache: 100, cacheRead: 800, cacheWrite: 100 },
  outputTokens: { total: 200, text: 200, reasoning: 0 },
};

const messageStart: LanguageModelV4StreamPart = {
  type: 'custom',
  kind: 'anthropic.message_start',
  providerMetadata: {
    anthropic: {
      id: 'msg_1',
      model: 'claude-sonnet-5-5',
      usage: {
        input_tokens: 100,
        cache_read_input_tokens: 800,
        cache_creation_input_tokens: 100,
        output_tokens: 1,
      },
    },
  },
};

const textBlock = (
  id: string,
  deltas: string[],
): LanguageModelV4StreamPart[] => [
  { type: 'text-start', id },
  ...deltas.map((delta): LanguageModelV4StreamPart => ({
    type: 'text-delta',
    id,
    delta,
  })),
  { type: 'text-end', id },
];

const finish = (
  unified: 'stop' | 'length' | 'content-filter' | 'other',
): LanguageModelV4StreamPart => ({
  type: 'finish',
  finishReason: { unified, raw: unified },
  usage: finishUsage,
});

const response = (
  deltas: string[],
  unified: 'stop' | 'length' | 'content-filter' | 'other' = 'stop',
): LanguageModelV4StreamPart[] => [
  { type: 'stream-start', warnings: [] },
  messageStart,
  ...textBlock('t', deltas),
  finish(unified),
];

const mockClaude = (
  stream:
    | LanguageModelV4StreamPart[]
    | ((abortSignal: AbortSignal | undefined) => ReadableStream),
): MockLanguageModelV4 => {
  const model = new MockLanguageModelV4({
    doStream: ({ abortSignal }) =>
      Promise.resolve({
        stream:
          typeof stream === 'function'
            ? stream(abortSignal)
            : convertArrayToReadableStream(stream),
      }),
  });
  vi.mocked(getGenerationModel).mockReturnValue(model);
  return model;
};

// 書き始めたところで止まって中断を待ち、中断されると実際の fetch と同じく、読み途中の
// ストリームを中断の理由でエラーにする Claude の代役
const hangingStream = (abortSignal: AbortSignal | undefined): ReadableStream =>
  new ReadableStream<LanguageModelV4StreamPart>({
    start(controller) {
      controller.enqueue({ type: 'stream-start', warnings: [] });
      controller.enqueue(messageStart);
      controller.enqueue({ type: 'text-start', id: 't' });
      controller.enqueue({ type: 'text-delta', id: 't', delta: '````md\n' });
      abortSignal?.addEventListener('abort', () => {
        controller.error(abortSignal.reason);
      });
    },
  });

type Run = {
  texts: string[];
  result: string;
  usage: UsageTokens[];
};

const run = async (
  input: Partial<Parameters<typeof streamSlidesDeck>[0]> = {},
): Promise<Run> => {
  const texts: string[] = [];
  const usage: UsageTokens[] = [];
  const generator = streamSlidesDeck({
    model: 'claude-sonnet-5-5',
    userPrompt: '5枚のスライドにする',
    abortSignal: undefined,
    onStepUsage: (tokens) => {
      usage.push(tokens);
    },
    ...input,
  });
  let next = await generator.next();
  while (next.done !== true) {
    texts.push(next.value);
    next = await generator.next();
  }
  return { texts, result: next.value, usage };
};

const STEP_TOKENS: UsageTokens = {
  inputTokens: 1000,
  outputTokens: 200,
  cacheReadTokens: 800,
  cacheWriteTokens: 100,
};

// message_start が持つ入力と cache の分。出力は数えられない
const STARTED_TOKENS: UsageTokens = {
  inputTokens: 1000,
  outputTokens: 0,
  cacheReadTokens: 800,
  cacheWriteTokens: 100,
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('streamSlidesDeck', () => {
  describe('正常系', () => {
    it('届いた text を積み上げた全文を delta ごとに流し、最後に全文を返す', async () => {
      mockClaude(response(['````md\n', '## まとめ\n', '````']));

      const { texts, result } = await run();

      expect(texts).toStrictEqual([
        '````md\n',
        '````md\n## まとめ\n',
        '````md\n## まとめ\n````',
      ]);
      expect(result).toBe('````md\n## まとめ\n````\n');
    });

    it('cache のブレークポイントを置いた、土台を含まないスライドの system と、渡した user の文で Claude を呼ぶ', async () => {
      const model = mockClaude(response(['````md\n## まとめ\n````']));

      await run({ userPrompt: '# 現在のデッキ\n\n# 指示\n表紙を直す' });

      expect(model.doStreamCalls[0]?.prompt).toMatchObject([
        {
          role: 'system',
          content: buildSlidesSystemPrompt(),
          providerOptions: {
            anthropic: { cacheControl: { type: 'ephemeral' } },
          },
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '# 現在のデッキ\n\n# 指示\n表紙を直す' },
          ],
        },
      ]);
      expect(
        model.doStreamCalls[0]?.providerOptions?.['anthropic'],
      ).toStrictEqual({ effort: 'medium', fallbacks: 'default' });
      expect(model.doStreamCalls[0]?.maxOutputTokens).toBe(16_000);
    });

    it('ステップの usage を渡す', async () => {
      mockClaude(response(['````md\n## まとめ\n````']));

      const { usage } = await run();

      expect(usage).toStrictEqual([STEP_TOKENS]);
    });
  });

  describe('異常系', () => {
    it('Claude がエラーを流したら、message_start の入力の分を usage に渡してからスライドのエラーの文で投げる', async () => {
      const usage: UsageTokens[] = [];
      mockClaude([
        { type: 'stream-start', warnings: [] },
        messageStart,
        { type: 'text-start', id: 't' },
        { type: 'text-delta', id: 't', delta: '````md\n' },
        { type: 'error', error: new Error('Overloaded') },
      ]);

      await expect(
        run({
          onStepUsage: (tokens) => {
            usage.push(tokens);
          },
        }),
      ).rejects.toThrow('スライドの生成でエラーが起きました: Overloaded');
      expect(usage).toStrictEqual([STARTED_TOKENS]);
    });

    it.each([
      [
        'length',
        '出力の上限に達したため、スライドを書ききれませんでした。枚数か内容を減らして頼んでください',
      ],
      ['content-filter', 'Claude がスライドの生成を控えました'],
      ['other', 'スライドの生成が途中で終わりました'],
    ] as const)('%s で終わったら投げる', async (unified, message) => {
      mockClaude(response(['````md\n## まとめ'], unified));

      await expect(run()).rejects.toThrow(message);
    });

    it('中断されたら、message_start の入力の分を usage に渡してから中断の理由で投げる', async () => {
      const controller = new AbortController();
      const usage: UsageTokens[] = [];
      mockClaude(hangingStream);
      const generator = streamSlidesDeck({
        model: 'claude-sonnet-5-5',
        userPrompt: '5枚のスライドにする',
        abortSignal: controller.signal,
        onStepUsage: (tokens) => {
          usage.push(tokens);
        },
      });

      await generator.next();
      controller.abort();

      await expect(generator.next()).rejects.toThrow(
        expect.objectContaining({ name: 'AbortError' }),
      );
      expect(usage).toStrictEqual([STARTED_TOKENS]);
    });
  });

  describe('エッジケース', () => {
    it('text のブロックの境目に改行を入れ、デッキの閉じフェンスと meta の開きの行を繋げない', async () => {
      mockClaude([
        { type: 'stream-start', warnings: [] },
        ...textBlock('t1', ['````md\n## まとめ\n````']),
        ...textBlock('t2', ['```json\n{}\n```']),
        finish('stop'),
      ]);

      const { result } = await run();

      expect(result).toBe('````md\n## まとめ\n````\n```json\n{}\n```\n');
    });
  });
});
