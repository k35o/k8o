import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';

import { settleUiRepair, settleUiSpec, uiUserPrompt } from './ui-spec';
import type { UiSpecDraft } from './ui-spec';

const BUTTON: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

const LARGE_BUTTON: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK', size: 'lg' } } },
};

// Button が知らない prop を1つずつ持つ、検証に落ちる spec
const brokenSpec = (count: number): Spec => ({
  root: 'root',
  elements: {
    root: {
      type: 'Stack',
      props: {},
      children: Array.from({ length: count }, (_, index) => `b${index}`),
    },
    ...Object.fromEntries(
      Array.from({ length: count }, (_, index) => [
        `b${index}`,
        { type: 'Button', props: { label: 'OK', bogus: index } },
      ]),
    ),
  },
});

const draftOf = (overrides: Partial<UiSpecDraft> = {}): UiSpecDraft => ({
  spec: BUTTON,
  appliedPatchCount: 2,
  prose: 'タイトル: 確認ボタン\nOK のボタンを置きました。',
  ...overrides,
});

describe('uiUserPrompt', () => {
  describe('正常系', () => {
    it('新しく作るときは、指示をそのまま渡す', () => {
      expect(
        uiUserPrompt({ instruction: 'OK のボタンを置く', base: null }),
      ).toBe('OK のボタンを置く');
    });

    it('直すときは、土台の spec と指示を、パッチだけを出させる編集の文で包む', () => {
      const prompt = uiUserPrompt({
        instruction: 'ボタンを大きくする',
        base: BUTTON,
      });

      expect(prompt).toContain(JSON.stringify(BUTTON, null, 2));
      expect(prompt).toContain('USER REQUEST: ボタンを大きくする');
      expect(prompt).toContain(
        'Output ONLY the JSON Patch lines needed for the change.',
      );
    });
  });
});

describe('settleUiSpec', () => {
  describe('正常系', () => {
    it('組み上がって検証に通れば、spec と、タイトル行を除いた会話文を要約にして返す', () => {
      expect(
        settleUiSpec({
          draft: draftOf(),
          base: null,
          instruction: 'OK のボタンを置く',
        }),
      ).toStrictEqual({
        type: 'ready',
        spec: BUTTON,
        summary: 'OK のボタンを置きました。',
      });
    });

    it('土台を変えたパッチなら、直した spec を返す', () => {
      expect(
        settleUiSpec({
          draft: draftOf({ spec: LARGE_BUTTON, appliedPatchCount: 1 }),
          base: BUTTON,
          instruction: 'ボタンを大きくする',
        }),
      ).toMatchObject({ type: 'ready', spec: LARGE_BUTTON });
    });
  });

  describe('異常系', () => {
    it('パッチが1件も無ければ、タイトル行を除いた会話文を添えて no-change にする', () => {
      expect(
        settleUiSpec({
          draft: draftOf({
            spec: null,
            appliedPatchCount: 0,
            prose: 'どの画面の UI か教えてください。',
          }),
          base: null,
          instruction: 'UI を作る',
        }),
      ).toStrictEqual({
        type: 'no-change',
        summary: 'どの画面の UI か教えてください。',
      });
    });

    it('パッチはあるのに組み上がらなければ、元の土台のまま、すべてを出し直させる指示で直させる', () => {
      expect(
        settleUiSpec({
          draft: draftOf({ spec: null }),
          base: null,
          instruction: 'OK のボタンを置く',
        }),
      ).toStrictEqual({
        type: 'repair',
        base: null,
        userPrompt:
          'OK のボタンを置く\n\n前の出力は、パッチから spec を組み立てられなかった。/root と /elements をすべて出し直すこと',
        reason: 'パッチから spec を組み立てられませんでした',
        summary: 'OK のボタンを置きました。',
      });
    });

    it('検証に落ちれば、壊れた spec を土台に、指摘を直させる編集の文で直させる', () => {
      const broken = brokenSpec(1);

      expect(
        settleUiSpec({
          draft: draftOf({ spec: broken }),
          base: null,
          instruction: 'OK のボタンを置く',
        }),
      ).toMatchObject({
        type: 'repair',
        base: broken,
        userPrompt: expect.stringContaining(
          `${JSON.stringify(broken, null, 2)}\n\`\`\`\n\nUSER REQUEST: The generated UI spec is invalid.`,
        ),
        reason:
          '[b0] Button: Unknown prop "bogus". Allowed props: label, variant, color, size, fullWidth, href.',
      });
    });
  });

  describe('エッジケース', () => {
    it('パッチを当てても土台と同じ spec のままなら、no-change にする', () => {
      expect(
        settleUiSpec({
          draft: draftOf({
            spec: structuredClone(BUTTON),
            appliedPatchCount: 1,
          }),
          base: BUTTON,
          instruction: 'ボタンを大きくする',
        }),
      ).toStrictEqual({
        type: 'no-change',
        summary: 'OK のボタンを置きました。',
      });
    });

    it('検証の指摘は先頭の3件だけを理由に載せる', () => {
      const unknownProp = (key: string): string =>
        `[${key}] Button: Unknown prop "bogus". Allowed props: label, variant, color, size, fullWidth, href.`;

      expect(
        settleUiSpec({
          draft: draftOf({ spec: brokenSpec(4) }),
          base: null,
          instruction: 'ボタンを4つ置く',
        }),
      ).toMatchObject({
        type: 'repair',
        reason: [unknownProp('b0'), unknownProp('b1'), unknownProp('b2')].join(
          ' / ',
        ),
      });
    });

    it('指摘は1件ずつ 120 文字で切り、3件とも理由に残す', () => {
      // 知らない部品の指摘は、catalog の部品名をすべて並べるので 1件で数百文字になる
      const unknownComponents: Spec = {
        root: 'root',
        elements: {
          root: { type: 'Stack', props: {}, children: ['g0', 'g1', 'g2'] },
          g0: { type: 'DataGrid', props: {} },
          g1: { type: 'DataGrid', props: {} },
          g2: { type: 'DataGrid', props: {} },
        },
      };

      expect(
        settleUiSpec({
          draft: draftOf({ spec: unknownComponents }),
          base: null,
          instruction: '表を3つ置く',
        }),
      ).toMatchObject({
        type: 'repair',
        reason: expect.stringMatching(
          /^\[g0\] Unknown component type .{92}… \/ \[g1\] Unknown component type .{92}… \/ \[g2\] Unknown component type .{92}…$/u,
        ),
      });
    });

    it('要素を指さない指摘は、文だけを理由に載せる', () => {
      expect(
        settleUiSpec({
          draft: draftOf({ spec: { ...BUTTON, root: 'missing' } }),
          base: null,
          instruction: 'OK のボタンを置く',
        }),
      ).toMatchObject({
        type: 'repair',
        reason: 'Root element "missing" not found in elements map.',
      });
    });

    it('土台を書き換えない', () => {
      const base = structuredClone(BUTTON);

      settleUiSpec({
        draft: draftOf({ spec: brokenSpec(1) }),
        base,
        instruction: 'ボタンを足す',
      });

      expect(base).toStrictEqual(BUTTON);
    });
  });
});

describe('settleUiRepair', () => {
  const repair = {
    type: 'repair',
    base: brokenSpec(1),
    userPrompt: '直して',
    reason: '[b0] Button: Unknown prop "bogus".',
    summary: '確認のボタンを並べました。',
  } as const;

  describe('正常系', () => {
    it('修復で検証に通れば、1回目の会話文を要約にして ready にする', () => {
      expect(
        settleUiRepair({
          repair,
          draft: draftOf({ prose: '知らない prop を消しました。' }),
          instruction: 'OK のボタンを置く',
        }),
      ).toStrictEqual({
        type: 'ready',
        spec: BUTTON,
        summary: '確認のボタンを並べました。',
      });
    });

    it('1回目の会話文が空なら、修復の会話文を要約にする', () => {
      expect(
        settleUiRepair({
          repair: { ...repair, summary: '' },
          draft: draftOf({ prose: '知らない prop を消しました。' }),
          instruction: 'OK のボタンを置く',
        }),
      ).toMatchObject({
        type: 'ready',
        summary: '知らない prop を消しました。',
      });
    });
  });

  describe('異常系', () => {
    it('修復でも検証に落ちれば、修復のあとの指摘を理由に失敗にする', () => {
      expect(
        settleUiRepair({
          repair,
          draft: draftOf({ spec: { ...BUTTON, root: 'missing' } }),
          instruction: 'OK のボタンを置く',
        }),
      ).toStrictEqual({
        type: 'failed',
        reason: 'Root element "missing" not found in elements map.',
      });
    });

    it('修復がパッチを出さなければ、1回目の指摘を理由に失敗にする', () => {
      expect(
        settleUiRepair({
          repair,
          draft: draftOf({ spec: repair.base, appliedPatchCount: 0 }),
          instruction: 'OK のボタンを置く',
        }),
      ).toStrictEqual({
        type: 'failed',
        reason: '[b0] Button: Unknown prop "bogus".',
      });
    });
  });
});
