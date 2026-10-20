import type { Spec } from '@json-render/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findPublicVersion } from '@/features/artifacts/application/artifact-shares';
import { highlightBlocks } from '@/features/highlight/application/highlight';

import { getArtifactPublicShare } from './share';

vi.mock('server-only', () => ({}));
vi.mock('@/features/artifacts/application/artifact-shares', () => ({
  findPublicVersion: vi.fn(),
}));
vi.mock('@/features/highlight/application/highlight', () => ({
  highlightBlocks: vi.fn(),
}));

const spec: Spec = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

const tokensOf = (content: string) => ({
  tokens: [[{ content, offset: 0 }]],
  fg: '#000000',
  bg: '#ffffff',
});

beforeEach(() => {
  vi.mocked(highlightBlocks).mockReset();
  vi.mocked(highlightBlocks).mockImplementation((blocks, theme) =>
    Promise.resolve(
      blocks.map((block) => tokensOf(`${theme}:${block.lang}:${block.code}`)),
    ),
  );
});

describe('getArtifactPublicShare', () => {
  describe('正常系', () => {
    it('UI はタイトルと spec だけを返す', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'ui',
        title: '料金表',
        spec,
      });

      await expect(getArtifactPublicShare(12)).resolves.toStrictEqual({
        kind: 'ui',
        title: '料金表',
        spec,
      });
      expect(findPublicVersion).toHaveBeenCalledExactlyOnceWith(12);
    });

    it('スライドは発表者ノートを外し、コードブロックごとに2つのテーマのハイライトを添える', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: '発表',
        source: [
          '## 1枚目',
          '<Notes>',
          '聞き手に見せないメモ',
          '</Notes>',
          '---',
          '## 2枚目',
          '```ts',
          'const a = 1;',
          '```',
          '```bash',
          'echo hi',
          '```',
        ].join('\n'),
      });

      await expect(getArtifactPublicShare(12)).resolves.toStrictEqual({
        kind: 'slides',
        title: '発表',
        source: [
          '## 1枚目',
          '',
          '---',
          '## 2枚目',
          '```ts',
          'const a = 1;',
          '```',
          '```bash',
          'echo hi',
          '```',
        ].join('\n'),
        highlights: [
          {
            lang: 'ts',
            code: 'const a = 1;',
            light: tokensOf('light:ts:const a = 1;'),
            dark: tokensOf('dark:ts:const a = 1;'),
          },
          {
            lang: 'bash',
            code: 'echo hi',
            light: tokensOf('light:bash:echo hi'),
            dark: tokensOf('dark:bash:echo hi'),
          },
        ],
      });
    });
  });

  describe('異常系', () => {
    it('版が引けなければ null を返し、ハイライトしない', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue(null);

      await expect(getArtifactPublicShare(12)).resolves.toBeNull();
      expect(highlightBlocks).not.toHaveBeenCalled();
    });

    it('ハイライトが上限で断られたブロックは、どちらのテーマも null にする', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: '発表',
        source: ['```ts', 'const a = 1;', '```'].join('\n'),
      });
      vi.mocked(highlightBlocks).mockImplementation((blocks) =>
        Promise.resolve(blocks.map(() => null)),
      );

      await expect(getArtifactPublicShare(12)).resolves.toMatchObject({
        highlights: [
          { lang: 'ts', code: 'const a = 1;', light: null, dark: null },
        ],
      });
    });
  });

  describe('エッジケース', () => {
    it('ノートに書いたコードブロックはハイライトしない', async () => {
      vi.mocked(findPublicVersion).mockResolvedValue({
        kind: 'slides',
        title: '発表',
        source: [
          '## 1枚目',
          '<Notes>',
          '```ts',
          'secret();',
          '```',
          '</Notes>',
        ].join('\n'),
      });

      await expect(getArtifactPublicShare(12)).resolves.toStrictEqual({
        kind: 'slides',
        title: '発表',
        source: '## 1枚目\n',
        highlights: [],
      });
    });
  });
});
