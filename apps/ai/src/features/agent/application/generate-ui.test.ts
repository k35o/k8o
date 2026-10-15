import type { Spec } from '@json-render/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findUiVersion,
  saveUiVersion,
} from '@/features/artifacts/application/artifacts';
import { streamUiSpec } from '@/features/generation/application/stream-ui-spec';
import type { UiSpecDraft } from '@/features/generation/application/ui-spec';
import type { UsageTokens } from '@/features/usage/application/pricing';
import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
} from '@/features/usage/infrastructure/usage-repository';

import { generateUi, generateUiModelOutput } from './generate-ui';
import type { GenerateUiOutput } from './generate-ui';

vi.mock('server-only', () => ({}));
vi.mock('@/features/generation/application/stream-ui-spec', () => ({
  streamUiSpec: vi.fn(),
}));
vi.mock('@/features/artifacts/application/artifacts', () => ({
  findUiVersion: vi.fn(),
  saveUiVersion: vi.fn(),
}));
vi.mock('@/features/usage/infrastructure/usage-repository', () => ({
  insertUsageWithinLimits: vi.fn(),
  selectCostSinceMicroUsd: vi.fn(),
  updateUsageCost: vi.fn(),
}));

const NOW = Date.parse('2026-10-15T12:00:00.000Z');

const BUTTON: Spec = {
  root: 'ok',
  elements: { ok: { type: 'Button', props: { label: 'OK' } } },
};

const LARGE_BUTTON: Spec = {
  root: 'ok',
  elements: { ok: { type: 'Button', props: { label: 'OK', size: 'lg' } } },
};

const BROKEN: Spec = {
  root: 'ok',
  elements: { ok: { type: 'Button', props: { label: 'OK', bogus: true } } },
};

const PROSE = 'タイトル: 確認\nOK のボタンを置きました。';

const draftOf = (
  spec: Spec | null,
  overrides: Partial<UiSpecDraft> = {},
): UiSpecDraft => ({ spec, appliedPatchCount: 1, prose: PROSE, ...overrides });

// 入力 1000（うちキャッシュの読み出し 800・書き込み 100）、出力 200。
// Sonnet 5.5 の単価で 100×2 + 100×2.5 + 800×0.2 + 200×10 = 2610 マイクロドル
const STEP_TOKENS: UsageTokens = {
  inputTokens: 1000,
  outputTokens: 200,
  cacheReadTokens: 800,
  cacheWriteTokens: 100,
};

type Attempt = {
  // 各 draft を流す時刻（NOW からの ms）。省くと NOW のまま
  drafts: Array<{ draft: UiSpecDraft; atMs?: number }>;
  result: UiSpecDraft;
  error?: Error;
};

// Claude の1回の呼び出しの代役。ステップの usage を渡してから、draft を順に流す
const mockAttempts = (...attempts: Attempt[]): void => {
  for (const attempt of attempts) {
    vi.mocked(streamUiSpec).mockImplementationOnce(async function* (input) {
      input.onStepUsage(STEP_TOKENS);
      for (const { draft, atMs } of attempt.drafts) {
        vi.setSystemTime(NOW + (atMs ?? 0));
        yield draft;
      }
      if (attempt.error !== undefined) {
        throw attempt.error;
      }
      return attempt.result;
    });
  }
};

const succeeded = (spec: Spec = BUTTON): Attempt => ({
  drafts: [{ draft: draftOf(spec) }],
  result: draftOf(spec),
});

const input = {
  title: '確認ボタン',
  instruction: 'OK のボタンを置く',
};

const context = {
  userId: 'u1',
  threadId: 'thread-1',
  model: 'claude-sonnet-5-5',
} as const;

const collect = async (
  generator: AsyncGenerator<GenerateUiOutput>,
): Promise<GenerateUiOutput[]> => {
  const outputs: GenerateUiOutput[] = [];
  for await (const output of generator) {
    outputs.push(output);
  }
  return outputs;
};

const run = (
  overrides: {
    input?: Partial<Parameters<typeof generateUi>[0]['input']>;
    abortSignal?: AbortSignal;
  } = {},
): AsyncGenerator<GenerateUiOutput> =>
  generateUi({
    input: { ...input, ...overrides.input },
    context,
    abortSignal: overrides.abortSignal,
  });

const phasesOf = (outputs: GenerateUiOutput[]): string[] =>
  outputs.map((output) =>
    output.status === 'generating' ? output.phase : output.status,
  );

// 書きかけとして流した spec のボタンの文言の、先頭の1文字
const progressLabelsOf = (outputs: GenerateUiOutput[]): string[] =>
  outputs.flatMap((output) =>
    output.status === 'generating' && output.spec !== null
      ? [String(output.spec.elements['ok']?.props['label']).charAt(0)]
      : [],
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
  vi.mocked(insertUsageWithinLimits).mockResolvedValue(7);
  vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(0);
  vi.mocked(updateUsageCost).mockResolvedValue();
  vi.mocked(findUiVersion).mockResolvedValue({
    id: 12,
    artifactId: 'a1b2c3d4e5f6',
    title: '確認ボタン',
    spec: BUTTON,
  });
  vi.mocked(saveUiVersion).mockResolvedValue({
    artifactId: 'a1b2c3d4e5f6',
    version: 1,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('generateUi', () => {
  describe('正常系', () => {
    it('新しく作るときは、考えている → 描いている → 保存した版の順に流す', async () => {
      mockAttempts(succeeded());

      await expect(collect(run())).resolves.toStrictEqual([
        { status: 'generating', phase: 'thinking', spec: null },
        { status: 'generating', phase: 'drawing', spec: BUTTON },
        {
          status: 'done',
          artifactId: 'a1b2c3d4e5f6',
          version: 1,
          summary: 'OK のボタンを置きました。',
          spec: BUTTON,
        },
      ]);
      expect(streamUiSpec).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          model: 'claude-sonnet-5-5',
          base: null,
          userPrompt: 'OK のボタンを置く',
        }),
      );
      expect(saveUiVersion).toHaveBeenCalledExactlyOnceWith({
        userId: 'u1',
        threadId: 'thread-1',
        base: null,
        title: '確認ボタン',
        instruction: 'OK のボタンを置く',
        summary: 'OK のボタンを置きました。',
        spec: BUTTON,
      });
    });

    it('Claude を呼ぶ前に、エージェントの UI の種類で利用の行を予約し、その呼び出しの usage を記録する', async () => {
      mockAttempts(succeeded());

      await collect(run());

      expect(insertUsageWithinLimits).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          app: 'agent',
          kind: 'ui',
          userId: 'u1',
          model: 'claude-sonnet-5-5',
        }),
      );
      expect(updateUsageCost).toHaveBeenCalledExactlyOnceWith({
        id: 7,
        ...STEP_TOKENS,
        costMicroUsd: 2610,
      });
    });

    it('保存した版は、版を保存して usage を書き終えてから流す', async () => {
      mockAttempts(succeeded());
      const writtenWhenYielded: Array<[string, number, number]> = [];

      for await (const output of run()) {
        writtenWhenYielded.push([
          output.status,
          vi.mocked(saveUiVersion).mock.calls.length,
          vi.mocked(updateUsageCost).mock.calls.length,
        ]);
      }

      expect(writtenWhenYielded).toStrictEqual([
        ['generating', 0, 0],
        ['generating', 0, 0],
        ['done', 1, 1],
      ]);
    });

    it('直すときは、持ち主の土台の版を読み、土台から描き始めて、その版の次として保存する', async () => {
      mockAttempts(succeeded(LARGE_BUTTON));
      vi.mocked(saveUiVersion).mockResolvedValue({
        artifactId: 'a1b2c3d4e5f6',
        version: 3,
      });

      const outputs = await collect(
        run({
          input: {
            instruction: 'ボタンを大きくする',
            base: { artifactId: 'a1b2c3d4e5f6', version: 2 },
          },
        }),
      );

      expect(findUiVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        version: 2,
        userId: 'u1',
      });
      expect(outputs[0]).toStrictEqual({
        status: 'generating',
        phase: 'thinking',
        spec: BUTTON,
      });
      expect(outputs.at(-1)).toMatchObject({ status: 'done', version: 3 });
      expect(streamUiSpec).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          base: BUTTON,
          userPrompt: expect.stringContaining(
            'USER REQUEST: ボタンを大きくする',
          ),
        }),
      );
      expect(saveUiVersion).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          base: expect.objectContaining({ id: 12, artifactId: 'a1b2c3d4e5f6' }),
          spec: LARGE_BUTTON,
        }),
      );
    });

    it('検証に落ちたら、壊れた spec を土台に1回だけ直させ、予約と記録を呼び出しごとに行う', async () => {
      const controller = new AbortController();
      mockAttempts(
        { drafts: [{ draft: draftOf(BROKEN) }], result: draftOf(BROKEN) },
        {
          drafts: [{ draft: draftOf(BUTTON, { prose: '' }), atMs: 300 }],
          result: draftOf(BUTTON, { prose: '' }),
        },
      );

      const outputs = await collect(run({ abortSignal: controller.signal }));

      expect(phasesOf(outputs)).toStrictEqual([
        'thinking',
        'drawing',
        'repairing',
        'repairing',
        'done',
      ]);
      expect(outputs[2]).toStrictEqual({
        status: 'generating',
        phase: 'repairing',
        spec: BROKEN,
      });
      expect(vi.mocked(streamUiSpec).mock.calls[1]?.[0]).toMatchObject({
        base: BROKEN,
        userPrompt: expect.stringContaining(
          'USER REQUEST: The generated UI spec is invalid.',
        ),
      });
      // 止めたときに修復の呼び出しも止まるよう、どちらにも tool の中断を渡す
      expect(vi.mocked(streamUiSpec).mock.calls[0]?.[0].abortSignal).toBe(
        controller.signal,
      );
      expect(vi.mocked(streamUiSpec).mock.calls[1]?.[0].abortSignal).toBe(
        controller.signal,
      );
      expect(outputs.at(-1)).toMatchObject({
        status: 'done',
        summary: 'OK のボタンを置きました。',
        spec: BUTTON,
      });
      expect(insertUsageWithinLimits).toHaveBeenCalledTimes(2);
      expect(updateUsageCost).toHaveBeenCalledTimes(2);
    });

    it('書きかけの spec は、前に流してから 300ms 経つまで流さない', async () => {
      const step = (label: string): UiSpecDraft =>
        draftOf({
          root: 'ok',
          elements: { ok: { type: 'Button', props: { label } } },
        });
      mockAttempts({
        drafts: [
          { draft: step('1'), atMs: 0 },
          { draft: step('2'), atMs: 299 },
          { draft: step('3'), atMs: 300 },
          { draft: step('4'), atMs: 599 },
        ],
        result: step('4'),
      });

      const outputs = await collect(run());

      expect(progressLabelsOf(outputs)).toStrictEqual(['1', '3']);
    });
  });

  describe('異常系', () => {
    it('土台の版が読めなければ、予約せずに見つからないエラーにする', async () => {
      vi.mocked(findUiVersion).mockResolvedValue(null);

      await expect(
        collect(
          run({ input: { base: { artifactId: 'missing', version: 2 } } }),
        ),
      ).rejects.toThrow('UI が見つかりません: artifactId missing の版 2');
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it('予約を断られたら、断りの文言でエラーにし、Claude を呼ばない', async () => {
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);

      await expect(collect(run())).rejects.toThrow(
        '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
      );
      expect(streamUiSpec).not.toHaveBeenCalled();
    });

    it('パッチを出さずに文章だけで答えたら、その文章を添えて変わらなかったエラーにする', async () => {
      mockAttempts({
        drafts: [],
        result: draftOf(null, {
          appliedPatchCount: 0,
          prose: 'どの画面の UI か教えてください。',
        }),
      });

      await expect(collect(run())).rejects.toThrow(
        'UI は変わりませんでした: どの画面の UI か教えてください。',
      );
      expect(saveUiVersion).not.toHaveBeenCalled();
    });

    it('修復しても検証に落ちたら、保存せずに直せなかったエラーにする', async () => {
      mockAttempts(
        { drafts: [], result: draftOf(BROKEN) },
        { drafts: [], result: draftOf({ ...BUTTON, root: 'missing' }) },
      );

      await expect(collect(run())).rejects.toThrow(
        'UI の検証エラーを直せませんでした: Root element "missing" not found in elements map.',
      );
      expect(saveUiVersion).not.toHaveBeenCalled();
      expect(updateUsageCost).toHaveBeenCalledTimes(2);
    });

    it('生成が失敗しても、その呼び出しの usage を記録してからエラーにする', async () => {
      mockAttempts({
        drafts: [],
        result: draftOf(BUTTON),
        error: new Error('UI の生成でエラーが起きました: Overloaded'),
      });

      await expect(collect(run())).rejects.toThrow(
        'UI の生成でエラーが起きました: Overloaded',
      );
      expect(updateUsageCost).toHaveBeenCalledOnce();
      expect(saveUiVersion).not.toHaveBeenCalled();
    });

    it('組み上がったあとで止められたら、保存せずに中断のエラーにする', async () => {
      const controller = new AbortController();
      vi.mocked(streamUiSpec).mockImplementationOnce(async function* () {
        yield draftOf(BUTTON);
        controller.abort();
        return draftOf(BUTTON);
      });

      await expect(
        collect(run({ abortSignal: controller.signal })),
      ).rejects.toThrow(expect.objectContaining({ name: 'AbortError' }));
      expect(vi.mocked(streamUiSpec).mock.calls[0]?.[0].abortSignal).toBe(
        controller.signal,
      );
      expect(saveUiVersion).not.toHaveBeenCalled();
      expect(updateUsageCost).toHaveBeenCalledOnce();
    });
  });

  describe('エッジケース', () => {
    it('base が null なら新しく作る', async () => {
      mockAttempts(succeeded());

      await collect(run({ input: { base: null } }));

      expect(findUiVersion).not.toHaveBeenCalled();
      expect(saveUiVersion).toHaveBeenCalledWith(
        expect.objectContaining({ base: null }),
      );
    });

    it('書きかけの spec は、流した時点の複製にする', async () => {
      const working: Spec = structuredClone(BUTTON);
      vi.mocked(streamUiSpec).mockImplementationOnce(async function* () {
        yield draftOf(working);
        working.root = 'changed';
        return draftOf(BUTTON);
      });

      const outputs = await collect(run());

      expect(outputs[1]).toStrictEqual({
        status: 'generating',
        phase: 'drawing',
        spec: BUTTON,
      });
    });

    it('大きい spec は、文字数 / 20 ms 経つまで次を流さない', async () => {
      // 詰めた JSON で 20,000 文字前後になる spec
      const large = (label: string): UiSpecDraft =>
        draftOf({
          root: 'ok',
          elements: {
            ok: { type: 'Button', props: { label: label.padEnd(20_000, '.') } },
          },
        });
      mockAttempts({
        drafts: [
          { draft: large('1'), atMs: 0 },
          { draft: large('2'), atMs: 999 },
          { draft: large('3'), atMs: 1100 },
        ],
        result: large('3'),
      });

      const outputs = await collect(run());

      expect(progressLabelsOf(outputs)).toStrictEqual(['1', '3']);
    });

    it('変わらなかったときにタイトル行のほかに文が無ければ、文を添えずにエラーにする', async () => {
      mockAttempts({
        drafts: [],
        result: draftOf(null, {
          appliedPatchCount: 0,
          prose: 'タイトル: 確認',
        }),
      });

      await expect(collect(run())).rejects.toThrow(
        /^UI は変わりませんでした$/u,
      );
    });

    it('変わらなかったときに添える文は 300 文字で切る', async () => {
      mockAttempts({
        drafts: [],
        result: draftOf(null, {
          appliedPatchCount: 0,
          prose: `タイトル: 確認\n${'あ'.repeat(301)}`,
        }),
      });

      await expect(collect(run())).rejects.toThrow(
        `UI は変わりませんでした: ${'あ'.repeat(300)}…`,
      );
    });

    it('要約は 300 文字で切り、続きがあることを … で示す', async () => {
      const prose = `タイトル: 確認\n${'あ'.repeat(301)}`;
      mockAttempts({
        drafts: [],
        result: draftOf(BUTTON, { prose }),
      });

      const outputs = await collect(run());

      expect(outputs.at(-1)).toMatchObject({
        status: 'done',
        summary: `${'あ'.repeat(300)}…`,
      });
    });
  });
});

describe('generateUiModelOutput', () => {
  const done: GenerateUiOutput = {
    status: 'done',
    artifactId: 'a1b2c3d4e5f6',
    version: 2,
    summary: 'ボタンを大きくしました。',
    spec: BUTTON,
  };

  describe('正常系', () => {
    it('保存した版の artifactId・版・タイトルと要約を、Claude に返す文にする', () => {
      expect(generateUiModelOutput({ input, output: done })).toStrictEqual({
        type: 'text',
        value:
          'UI「確認ボタン」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。\nボタンを大きくしました。',
      });
    });

    it('DB の JSON から戻した値でも、同じ文を返す', () => {
      // oxlint-disable-next-line unicorn/prefer-structured-clone -- DB の JSON の列と同じく、JSON で往復させる
      const restored = JSON.parse(
        JSON.stringify({ input, output: done }),
      ) as Parameters<typeof generateUiModelOutput>[0];

      expect(generateUiModelOutput(restored)).toStrictEqual(
        generateUiModelOutput({ input, output: done }),
      );
    });
  });

  describe('エッジケース', () => {
    it('要約が空なら、保存したことだけを返す', () => {
      expect(
        generateUiModelOutput({ input, output: { ...done, summary: '' } }),
      ).toStrictEqual({
        type: 'text',
        value:
          'UI「確認ボタン」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。',
      });
    });

    it('生成中の出力には、完了していないことを返す', () => {
      expect(
        generateUiModelOutput({
          input,
          output: { status: 'generating', phase: 'drawing', spec: null },
        }),
      ).toStrictEqual({ type: 'text', value: 'UI の生成は完了していません' });
    });
  });
});
