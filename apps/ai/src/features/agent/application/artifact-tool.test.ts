import { describe, expect, it, vi } from 'vitest';

import { artifactModelOutput } from './artifact-tool';

vi.mock('server-only', () => ({}));
vi.mock('@/features/artifacts/infrastructure/artifact-repository', () => ({}));
vi.mock('@/features/usage/infrastructure/usage-repository', () => ({}));

describe('artifactModelOutput', () => {
  const ui = {
    input: { title: '確認ボタン' },
    output: {
      status: 'done',
      artifactId: 'a1b2c3d4e5f6',
      version: 2,
      summary: 'ボタンを大きくしました。',
    },
  } as const;
  const slides = {
    input: { title: 'LT の資料' },
    output: {
      status: 'done',
      artifactId: 'a1b2c3d4e5f6',
      version: 2,
      summary: 'まとめに振り返りを足しました。',
    },
  } as const;

  describe('正常系', () => {
    it('保存した UI の版の artifactId・版・タイトルと要約を、Claude に返す文にする', () => {
      expect(artifactModelOutput('ui', ui)).toStrictEqual({
        type: 'text',
        value:
          'UI「確認ボタン」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。\nボタンを大きくしました。',
      });
    });

    it('保存したスライドの版の artifactId・版・タイトルと要約を、Claude に返す文にする', () => {
      expect(artifactModelOutput('slides', slides)).toStrictEqual({
        type: 'text',
        value:
          'スライド「LT の資料」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。\nまとめに振り返りを足しました。',
      });
    });

    it('DB の JSON から戻した値でも、同じ文を返す', () => {
      // oxlint-disable-next-line unicorn/prefer-structured-clone -- DB の JSON の列と同じく、JSON で往復させる
      const restored = JSON.parse(JSON.stringify(ui)) as typeof ui;

      expect(artifactModelOutput('ui', restored)).toStrictEqual({
        type: 'text',
        value:
          'UI「確認ボタン」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。\nボタンを大きくしました。',
      });
    });
  });

  describe('エッジケース', () => {
    it('要約が空なら、保存したことだけを返す', () => {
      expect(
        artifactModelOutput('slides', {
          ...slides,
          output: { ...slides.output, summary: '' },
        }),
      ).toStrictEqual({
        type: 'text',
        value:
          'スライド「LT の資料」を artifactId: a1b2c3d4e5f6 の版 2 として保存し、利用者の画面のプレビューに出しました。',
      });
    });

    it('生成中の UI の出力には、完了していないことを返す', () => {
      expect(
        artifactModelOutput('ui', {
          ...ui,
          output: { status: 'generating' },
        }),
      ).toStrictEqual({ type: 'text', value: 'UI の生成は完了していません' });
    });

    it('生成中のスライドの出力には、完了していないことを返す', () => {
      expect(
        artifactModelOutput('slides', {
          ...slides,
          output: { status: 'generating' },
        }),
      ).toStrictEqual({
        type: 'text',
        value: 'スライドの生成は完了していません',
      });
    });
  });
});
