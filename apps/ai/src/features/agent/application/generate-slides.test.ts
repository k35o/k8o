import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findSlidesVersion,
  saveSlidesVersion,
} from '@/features/artifacts/application/artifacts';
import { streamSlidesDeck } from '@/features/generation/application/stream-slides-deck';
import type { UsageTokens } from '@/features/usage/application/pricing';
import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
} from '@/features/usage/infrastructure/usage-repository';

import { generateSlides, generateSlidesModelOutput } from './generate-slides';
import type { GenerateSlidesOutput } from './generate-slides';

vi.mock('server-only', () => ({}));
vi.mock('@/features/generation/application/stream-slides-deck', () => ({
  streamSlidesDeck: vi.fn(),
}));
vi.mock('@/features/artifacts/application/artifacts', () => ({
  findSlidesVersion: vi.fn(),
  saveSlidesVersion: vi.fn(),
}));
vi.mock('@/features/usage/infrastructure/usage-repository', () => ({
  insertUsageWithinLimits: vi.fn(),
  selectCostSinceMicroUsd: vi.fn(),
  updateUsageCost: vi.fn(),
}));

const NOW = Date.parse('2026-10-16T12:00:00.000Z');

const COVER = '<Cover>\n# 発表\n</Cover>';

const DECK = [COVER, '', '---', '', '## まとめ', '', '- 振り返り'].join('\n');

const BASE_DECK = [COVER, '', '---', '', '## 前のまとめ'].join('\n');

const metaOf = (description: string): string =>
  JSON.stringify({ title: '発表', description, changes: [] });

const outputOf = (
  deck: string,
  description = '2枚のスライドにしました。',
): string =>
  ['````md', deck, '````', '', '```json', metaOf(description), '```'].join(
    '\n',
  );

// 入力 1000（うちキャッシュの読み出し 800・書き込み 100）、出力 200。
// Sonnet 5.5 の単価で 100×2 + 100×2.5 + 800×0.2 + 200×10 = 2610 マイクロドル
const STEP_TOKENS: UsageTokens = {
  inputTokens: 1000,
  outputTokens: 200,
  cacheReadTokens: 800,
  cacheWriteTokens: 100,
};

type Attempt = {
  // 積み上がった全文を流す時刻（NOW からの ms）。省くと NOW のまま
  texts: Array<{ text: string; atMs?: number }>;
  result: string;
  error?: Error;
};

// Claude の1回の呼び出しの代役。ステップの usage を渡してから、積み上がった全文を順に流す
const mockAttempt = (attempt: Attempt): void => {
  vi.mocked(streamSlidesDeck).mockImplementationOnce(async function* (input) {
    input.onStepUsage(STEP_TOKENS);
    for (const { text, atMs } of attempt.texts) {
      vi.setSystemTime(NOW + (atMs ?? 0));
      yield text;
    }
    if (attempt.error !== undefined) {
      throw attempt.error;
    }
    return attempt.result;
  });
};

const succeeded = (deck = DECK): Attempt => ({
  texts: [{ text: outputOf(deck) }],
  result: outputOf(deck),
});

// 書き始めてから流した全文。デッキの開きフェンスのあとに書いた分だけを持つ
const writing = (deck: string): string => `\`\`\`\`md\n${deck}`;

const input = {
  title: 'LT の資料',
  instruction: '2枚のスライドにする',
};

const context = {
  userId: 'u1',
  threadId: 'thread-1',
  model: 'claude-sonnet-5-5',
} as const;

const collect = async (
  generator: AsyncGenerator<GenerateSlidesOutput>,
): Promise<GenerateSlidesOutput[]> => {
  const outputs: GenerateSlidesOutput[] = [];
  for await (const output of generator) {
    outputs.push(output);
  }
  return outputs;
};

const run = (
  overrides: {
    input?: Partial<Parameters<typeof generateSlides>[0]['input']>;
    abortSignal?: AbortSignal;
  } = {},
): AsyncGenerator<GenerateSlidesOutput> =>
  generateSlides({
    input: { ...input, ...overrides.input },
    context,
    abortSignal: overrides.abortSignal,
  });

// 書いているあいだに流した source
const writtenSourcesOf = (outputs: GenerateSlidesOutput[]): string[] =>
  outputs.flatMap((output) =>
    output.status === 'generating' && output.phase === 'writing'
      ? [output.source ?? '']
      : [],
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: NOW });
  vi.mocked(insertUsageWithinLimits).mockResolvedValue(7);
  vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(0);
  vi.mocked(updateUsageCost).mockResolvedValue();
  vi.mocked(findSlidesVersion).mockResolvedValue({
    id: 12,
    artifactId: 'a1b2c3d4e5f6',
    title: 'LT の資料',
    source: BASE_DECK,
  });
  vi.mocked(saveSlidesVersion).mockResolvedValue({
    artifactId: 'a1b2c3d4e5f6',
    version: 1,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('generateSlides', () => {
  describe('正常系', () => {
    it('新しく作るときは、考えている → 書いている → 保存した版の順に流す', async () => {
      mockAttempt({
        texts: [{ text: writing(COVER) }, { text: outputOf(DECK), atMs: 300 }],
        result: outputOf(DECK),
      });

      await expect(collect(run())).resolves.toStrictEqual([
        { status: 'generating', phase: 'thinking', source: null },
        { status: 'generating', phase: 'writing', source: COVER },
        { status: 'generating', phase: 'writing', source: DECK },
        {
          status: 'done',
          artifactId: 'a1b2c3d4e5f6',
          version: 1,
          summary: '2枚のスライドにしました。',
          source: DECK,
        },
      ]);
      expect(streamSlidesDeck).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          model: 'claude-sonnet-5-5',
          userPrompt: '2枚のスライドにする',
        }),
      );
      expect(saveSlidesVersion).toHaveBeenCalledExactlyOnceWith({
        userId: 'u1',
        threadId: 'thread-1',
        base: null,
        title: 'LT の資料',
        instruction: '2枚のスライドにする',
        summary: '2枚のスライドにしました。',
        source: DECK,
      });
    });

    it('Claude を呼ぶ前に、エージェントのスライドの種類で利用の行を1回だけ予約し、その呼び出しの usage を記録する', async () => {
      mockAttempt(succeeded());

      await collect(run());

      expect(insertUsageWithinLimits).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          app: 'agent',
          kind: 'slides',
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
      mockAttempt(succeeded());
      const writtenWhenYielded: Array<[string, number, number]> = [];

      for await (const output of run()) {
        writtenWhenYielded.push([
          output.status,
          vi.mocked(saveSlidesVersion).mock.calls.length,
          vi.mocked(updateUsageCost).mock.calls.length,
        ]);
      }

      expect(writtenWhenYielded).toStrictEqual([
        ['generating', 0, 0],
        ['generating', 0, 0],
        ['done', 1, 1],
      ]);
    });

    it('直すときは、持ち主の土台の版を user の文に置き、考えているあいだは土台を流さず、その版の次として保存する', async () => {
      const controller = new AbortController();
      mockAttempt(succeeded());
      vi.mocked(saveSlidesVersion).mockResolvedValue({
        artifactId: 'a1b2c3d4e5f6',
        version: 3,
      });

      const outputs = await collect(
        run({
          input: {
            instruction: 'まとめに振り返りを足す',
            base: { artifactId: 'a1b2c3d4e5f6', version: 2 },
          },
          abortSignal: controller.signal,
        }),
      );

      expect(findSlidesVersion).toHaveBeenCalledExactlyOnceWith({
        artifactId: 'a1b2c3d4e5f6',
        version: 2,
        userId: 'u1',
      });
      expect(outputs[0]).toStrictEqual({
        status: 'generating',
        phase: 'thinking',
        source: null,
      });
      expect(outputs.at(-1)).toMatchObject({ status: 'done', version: 3 });
      expect(vi.mocked(streamSlidesDeck).mock.calls[0]?.[0]).toMatchObject({
        userPrompt: expect.stringMatching(
          /^# 現在のデッキ[\s\S]*## 前のまとめ[\s\S]*# 指示\nまとめに振り返りを足す$/u,
        ),
        abortSignal: controller.signal,
      });
      expect(saveSlidesVersion).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          base: expect.objectContaining({ id: 12, artifactId: 'a1b2c3d4e5f6' }),
          source: DECK,
        }),
      );
    });

    it('1枚も読めない書き始めは流さず、1枚目が読めたときに間引かずに流す', async () => {
      mockAttempt({
        texts: [
          { text: '````md\n', atMs: 0 },
          { text: writing('<Cov'), atMs: 1 },
          { text: writing('<Cover>\n# 発'), atMs: 2 },
        ],
        result: outputOf(DECK),
      });

      const outputs = await collect(run());

      expect(writtenSourcesOf(outputs)).toStrictEqual(['<Cover>\n# 発']);
    });

    it('書きかけのデッキは、前に流してから 300ms 経つまで流さない', async () => {
      const step = (heading: string): string =>
        writing(`${COVER}\n\n---\n\n## ${heading}`);
      mockAttempt({
        texts: [
          { text: step('1'), atMs: 0 },
          { text: step('2'), atMs: 299 },
          { text: step('3'), atMs: 300 },
          { text: step('4'), atMs: 599 },
        ],
        result: outputOf(DECK),
      });

      const outputs = await collect(run());

      expect(writtenSourcesOf(outputs)).toStrictEqual([
        `${COVER}\n\n---\n\n## 1`,
        `${COVER}\n\n---\n\n## 3`,
      ]);
    });
  });

  describe('異常系', () => {
    it('土台の版が読めなければ、予約せずに見つからないエラーにする', async () => {
      vi.mocked(findSlidesVersion).mockResolvedValue(null);

      await expect(
        collect(
          run({ input: { base: { artifactId: 'missing', version: 2 } } }),
        ),
      ).rejects.toThrow('スライドが見つかりません: artifactId missing の版 2');
      expect(insertUsageWithinLimits).not.toHaveBeenCalled();
    });

    it('予約を断られたら、断りの文言でエラーにし、Claude を呼ばない', async () => {
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);

      await expect(collect(run())).rejects.toThrow(
        '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
      );
      expect(streamSlidesDeck).not.toHaveBeenCalled();
    });

    it('デッキを書かずに文章だけで答えたら、その文章を添えて変わらなかったエラーにし、usage は記録する', async () => {
      mockAttempt({
        texts: [{ text: 'どの記事のスライドか教えてください。' }],
        result: 'どの記事のスライドか教えてください。',
      });

      await expect(collect(run())).rejects.toThrow(
        'スライドは変わりませんでした: どの記事のスライドか教えてください。',
      );
      expect(saveSlidesVersion).not.toHaveBeenCalled();
      expect(updateUsageCost).toHaveBeenCalledOnce();
    });

    it('土台と同じデッキなら、meta の説明を添えて変わらなかったエラーにする', async () => {
      mockAttempt({
        texts: [],
        result: outputOf(BASE_DECK, '直すところはありませんでした。'),
      });

      await expect(
        collect(
          run({ input: { base: { artifactId: 'a1b2c3d4e5f6', version: 2 } } }),
        ),
      ).rejects.toThrow(
        'スライドは変わりませんでした: 直すところはありませんでした。',
      );
      expect(saveSlidesVersion).not.toHaveBeenCalled();
    });

    it('外側が3つのバッククォートで、中のコードブロックのフェンスでデッキが切れたら、保存せずに読み取れなかったエラーにする', async () => {
      const deck = [
        DECK,
        '',
        '---',
        '',
        '## 入れ方',
        '```',
        'npm i',
        '```',
      ].join('\n');
      const text = [
        '```md',
        deck,
        '```',
        '',
        '```json',
        metaOf(''),
        '```',
      ].join('\n');
      mockAttempt({ texts: [], result: text });

      await expect(collect(run())).rejects.toThrow(
        'スライドを読み取れませんでした: デッキを囲むフェンスが閉じていないか、中のコードブロックで切れています',
      );
      expect(saveSlidesVersion).not.toHaveBeenCalled();
      expect(updateUsageCost).toHaveBeenCalledOnce();
    });

    it('デッキの中のコードブロックが閉じていなければ、保存せずに読み取れなかったエラーにする', async () => {
      mockAttempt({
        texts: [],
        result: outputOf(`${DECK}\n\n---\n\n## 入れ方\n\`\`\`sh\nnpm i`),
      });

      await expect(collect(run())).rejects.toThrow(
        'スライドを読み取れませんでした: デッキの中のコードブロックが閉じていません',
      );
      expect(saveSlidesVersion).not.toHaveBeenCalled();
    });

    it('生成が失敗しても、その呼び出しの usage を記録してからエラーにする', async () => {
      mockAttempt({
        texts: [],
        result: outputOf(DECK),
        error: new Error('スライドの生成でエラーが起きました: Overloaded'),
      });

      await expect(collect(run())).rejects.toThrow(
        'スライドの生成でエラーが起きました: Overloaded',
      );
      expect(updateUsageCost).toHaveBeenCalledOnce();
      expect(saveSlidesVersion).not.toHaveBeenCalled();
    });

    it('書き終えたあとで止められたら、保存せずに中断のエラーにし、usage は記録する', async () => {
      const controller = new AbortController();
      vi.mocked(streamSlidesDeck).mockImplementationOnce(async function* () {
        yield outputOf(DECK);
        controller.abort();
        return outputOf(DECK);
      });

      await expect(
        collect(run({ abortSignal: controller.signal })),
      ).rejects.toThrow(expect.objectContaining({ name: 'AbortError' }));
      expect(saveSlidesVersion).not.toHaveBeenCalled();
      expect(updateUsageCost).toHaveBeenCalledOnce();
    });
  });

  describe('エッジケース', () => {
    it('base が null なら新しく作る', async () => {
      mockAttempt(succeeded());

      await collect(run({ input: { base: null } }));

      expect(findSlidesVersion).not.toHaveBeenCalled();
      expect(saveSlidesVersion).toHaveBeenCalledWith(
        expect.objectContaining({ base: null }),
      );
    });

    it('meta が無ければ、要約を空にして保存する', async () => {
      const text = ['````md', DECK, '````'].join('\n');
      mockAttempt({ texts: [], result: text });

      const outputs = await collect(run());

      expect(outputs.at(-1)).toMatchObject({ status: 'done', summary: '' });
    });

    it('変わらなかったときに添える文が無ければ、文を添えずにエラーにする', async () => {
      mockAttempt({
        texts: [],
        result: ['````md', BASE_DECK, '````'].join('\n'),
      });

      await expect(
        collect(
          run({ input: { base: { artifactId: 'a1b2c3d4e5f6', version: 2 } } }),
        ),
      ).rejects.toThrow(/^スライドは変わりませんでした$/u);
    });

    it('変わらなかったときに添える文は 300 文字で切る', async () => {
      mockAttempt({ texts: [], result: 'あ'.repeat(301) });

      await expect(collect(run())).rejects.toThrow(
        `スライドは変わりませんでした: ${'あ'.repeat(300)}…`,
      );
    });

    it('要約は 300 文字で切り、続きがあることを … で示す', async () => {
      mockAttempt({ texts: [], result: outputOf(DECK, 'あ'.repeat(301)) });

      const outputs = await collect(run());

      expect(outputs.at(-1)).toMatchObject({
        status: 'done',
        summary: `${'あ'.repeat(300)}…`,
      });
    });

    it('大きいデッキは、文字数 / 20 ms 経つまで次を流さない', async () => {
      // 20,000 文字前後のデッキ
      const large = (heading: string): string =>
        writing(`${COVER}\n\n---\n\n## ${heading}\n\n${'あ'.repeat(20_000)}`);
      mockAttempt({
        texts: [
          { text: large('1'), atMs: 0 },
          { text: large('2'), atMs: 999 },
          { text: large('3'), atMs: 1100 },
        ],
        result: outputOf(DECK),
      });

      const outputs = await collect(run());

      expect(
        writtenSourcesOf(outputs).map(
          (source) => /## (?<heading>\d)/u.exec(source)?.groups?.['heading'],
        ),
      ).toStrictEqual(['1', '3']);
    });
  });
});

describe('generateSlidesModelOutput', () => {
  const done: GenerateSlidesOutput = {
    status: 'done',
    artifactId: 'a1b2c3d4e5f6',
    version: 2,
    summary: 'まとめに振り返りを足しました。',
    source: DECK,
  };

  describe('正常系', () => {
    it('保存した版の artifactId・版・タイトルと要約を、Claude に返す文にする', () => {
      expect(generateSlidesModelOutput({ input, output: done })).toStrictEqual({
        type: 'text',
        value:
          'スライド「LT の資料」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。\nまとめに振り返りを足しました。',
      });
    });

    it('DB の JSON から戻した値でも、同じ文を返す', () => {
      // oxlint-disable-next-line unicorn/prefer-structured-clone -- DB の JSON の列と同じく、JSON で往復させる
      const restored = JSON.parse(
        JSON.stringify({ input, output: done }),
      ) as Parameters<typeof generateSlidesModelOutput>[0];

      expect(generateSlidesModelOutput(restored)).toStrictEqual(
        generateSlidesModelOutput({ input, output: done }),
      );
    });
  });

  describe('エッジケース', () => {
    it('要約が空なら、保存したことだけを返す', () => {
      expect(
        generateSlidesModelOutput({ input, output: { ...done, summary: '' } }),
      ).toStrictEqual({
        type: 'text',
        value:
          'スライド「LT の資料」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。',
      });
    });

    it('生成中の出力には、完了していないことを返す', () => {
      expect(
        generateSlidesModelOutput({
          input,
          output: { status: 'generating', phase: 'writing', source: DECK },
        }),
      ).toStrictEqual({
        type: 'text',
        value: 'スライドの生成は完了していません',
      });
    });
  });
});
