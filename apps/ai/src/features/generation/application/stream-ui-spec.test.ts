import type { Spec } from '@json-render/core';
import { convertArrayToReadableStream, MockLanguageModelV4 } from 'ai/test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UsageTokens } from '@/features/usage/application/pricing';
import { getGenerationModel } from '@/shared/claude/claude-provider';

import { buildSpecSystemPrompt } from './build-spec-system-prompt';
import { streamUiSpec } from './stream-ui-spec';
import type { UiSpecDraft } from './ui-spec';

vi.mock('@/shared/claude/claude-provider', () => ({
  getGenerationModel: vi.fn(),
}));

type LanguageModelV4StreamPart =
  Awaited<
    ReturnType<MockLanguageModelV4['doStream']>
  >['stream'] extends ReadableStream<infer PART>
    ? PART
    : never;

const ROOT_PATCH = '{"op":"add","path":"/root","value":"root"}';
const STACK_PATCH =
  '{"op":"add","path":"/elements/root","value":{"type":"Stack","props":{},"children":["ok"]}}';
const BUTTON_PATCH =
  '{"op":"add","path":"/elements/ok","value":{"type":"Button","props":{"label":"OK"}}}';

const BUILT: Spec = {
  root: 'root',
  elements: {
    root: { type: 'Stack', props: {}, children: ['ok'] },
    ok: { type: 'Button', props: { label: 'OK' } },
  },
};

const BASE: Spec = {
  root: 'ok',
  elements: { ok: { type: 'Button', props: { label: 'OK' } } },
};

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
      controller.enqueue({
        type: 'text-delta',
        id: 't',
        delta: `${ROOT_PATCH}\n`,
      });
      abortSignal?.addEventListener('abort', () => {
        controller.error(abortSignal.reason);
      });
    },
  });

type Run = {
  drafts: UiSpecDraft[];
  result: UiSpecDraft;
  usage: UsageTokens[];
};

// yield された draft は組み立て中のオブジェクトなので、その時点の複製を残す
const run = async (
  input: Partial<Parameters<typeof streamUiSpec>[0]> = {},
): Promise<Run> => {
  const drafts: UiSpecDraft[] = [];
  const usage: UsageTokens[] = [];
  const generator = streamUiSpec({
    model: 'claude-sonnet-5-5',
    base: null,
    userPrompt: '確認のボタンを置く',
    abortSignal: undefined,
    onStepUsage: (tokens) => {
      usage.push(tokens);
    },
    ...input,
  });
  let next = await generator.next();
  while (next.done !== true) {
    drafts.push(structuredClone(next.value));
    next = await generator.next();
  }
  return { drafts, result: next.value, usage };
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

describe('streamUiSpec', () => {
  describe('正常系', () => {
    it('会話文とパッチを分け、パッチが当たるたびに育つ spec を流し、最後の draft を返す', async () => {
      mockClaude(
        response([
          'タイトル: 確認\nOK のボタンを置きました。\n```spec\n',
          `${ROOT_PATCH}\n`,
          `${STACK_PATCH}\n`,
          `${BUTTON_PATCH}\n\`\`\``,
        ]),
      );

      const { drafts, result } = await run();

      expect(drafts).toStrictEqual([
        {
          spec: null,
          appliedPatchCount: 1,
          prose: 'タイトル: 確認\nOK のボタンを置きました。',
        },
        {
          spec: {
            root: 'root',
            elements: { root: BUILT.elements['root'] },
          },
          appliedPatchCount: 2,
          prose: 'タイトル: 確認\nOK のボタンを置きました。',
        },
        {
          spec: BUILT,
          appliedPatchCount: 3,
          prose: 'タイトル: 確認\nOK のボタンを置きました。',
        },
      ]);
      expect(result).toStrictEqual(drafts.at(-1));
    });

    it('土台の spec の複製にパッチを当て、土台は書き換えない', async () => {
      const base = structuredClone(BASE);
      mockClaude(
        response([
          '{"op":"replace","path":"/elements/ok/props/label","value":"送る"}',
        ]),
      );

      const { result } = await run({ base });

      expect(result.spec).toStrictEqual({
        root: 'ok',
        elements: { ok: { type: 'Button', props: { label: '送る' } } },
      });
      expect(base).toStrictEqual(BASE);
    });

    it('cache のブレークポイントを置いた、修復の指示を含まない UI の system と、渡した user の文で Claude を呼ぶ', async () => {
      const model = mockClaude(response([ROOT_PATCH]));

      await run({ userPrompt: 'ボタンを置く' });

      expect(model.doStreamCalls[0]?.prompt).toMatchObject([
        {
          role: 'system',
          content: buildSpecSystemPrompt(),
          providerOptions: {
            anthropic: { cacheControl: { type: 'ephemeral' } },
          },
        },
        {
          role: 'user',
          content: [{ type: 'text', text: 'ボタンを置く' }],
        },
      ]);
      expect(
        model.doStreamCalls[0]?.providerOptions?.['anthropic'],
      ).toStrictEqual({ effort: 'medium', fallbacks: 'default' });
    });

    it('ステップの usage を渡す', async () => {
      mockClaude(response([ROOT_PATCH]));

      const { usage } = await run();

      expect(usage).toStrictEqual([STEP_TOKENS]);
    });
  });

  describe('異常系', () => {
    it('Claude がエラーを流して finish が来なければ、message_start の入力の分を usage に渡してからエラーの文で投げる', async () => {
      const usage: UsageTokens[] = [];
      // Anthropic は finish を message_stop でしか流さないので、途中のエラーのあとには何も来ない
      mockClaude([
        { type: 'stream-start', warnings: [] },
        messageStart,
        { type: 'text-start', id: 't' },
        { type: 'text-delta', id: 't', delta: `${ROOT_PATCH}\n` },
        { type: 'error', error: new Error('Overloaded') },
      ]);

      await expect(
        run({
          onStepUsage: (tokens) => {
            usage.push(tokens);
          },
        }),
      ).rejects.toThrow('UI の生成でエラーが起きました: Overloaded');
      expect(usage).toStrictEqual([STARTED_TOKENS]);
    });

    it('エラーのあとに finish の usage が届いたら、その usage だけを渡し、message_start の分を重ねない', async () => {
      const usage: UsageTokens[] = [];
      mockClaude([
        { type: 'stream-start', warnings: [] },
        messageStart,
        ...textBlock('t', [`${ROOT_PATCH}\n`]),
        { type: 'error', error: new Error('Overloaded') },
        finish('other'),
      ]);

      await expect(
        run({
          onStepUsage: (tokens) => {
            usage.push(tokens);
          },
        }),
      ).rejects.toThrow('UI の生成でエラーが起きました: Overloaded');
      expect(usage).toStrictEqual([STEP_TOKENS]);
    });

    it.each([
      [
        'length',
        '出力の上限に達したため、UI を組み立てられませんでした。小さく分けて頼んでください',
      ],
      ['content-filter', 'Claude が UI の生成を控えました'],
      ['other', 'UI の生成が途中で終わりました'],
    ] as const)('%s で終わったら投げる', async (unified, message) => {
      mockClaude(response([ROOT_PATCH], unified));

      await expect(run()).rejects.toThrow(message);
    });

    it('中断されたら、message_start の入力の分を usage に渡してから中断の理由で投げる', async () => {
      const controller = new AbortController();
      const usage: UsageTokens[] = [];
      mockClaude(hangingStream);
      const generator = streamUiSpec({
        model: 'claude-sonnet-5-5',
        base: null,
        userPrompt: '確認のボタンを置く',
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
    it('text のブロックの境目で、前のブロックの最後の行と次の行を繋げない', async () => {
      mockClaude([
        { type: 'stream-start', warnings: [] },
        ...textBlock('t1', ['OK のボタンを置きました。']),
        ...textBlock('t2', [ROOT_PATCH]),
        finish('stop'),
      ]);

      const { result } = await run();

      expect(result).toStrictEqual({
        spec: null,
        appliedPatchCount: 1,
        prose: 'OK のボタンを置きました。',
      });
    });

    it('当てられないパッチは数えずに飛ばす', async () => {
      mockClaude(
        response([
          `${ROOT_PATCH}\n`,
          '{"op":"test","path":"/root","value":"other"}\n',
          `${BUTTON_PATCH}\n`,
        ]),
      );

      const { result } = await run();

      expect(result.appliedPatchCount).toBe(2);
    });
  });
});
