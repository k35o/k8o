import { highlightCode } from '@repo/code-highlight/tokenize';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { highlightBlocks } from './highlight';

vi.mock('server-only', () => ({}));
vi.mock('@repo/code-highlight/tokenize', () => ({
  highlightCode: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(highlightCode).mockReset();
  vi.mocked(highlightCode).mockImplementation((code, lang, theme) =>
    Promise.resolve({
      tokens: [[{ content: `${lang}:${theme ?? ''}:${code}`, offset: 0 }]],
      fg: '#000000',
      bg: '#ffffff',
    }),
  );
});

describe('highlightBlocks', () => {
  describe('正常系', () => {
    it('ブロックごとに、同じ順でハイライトを返す', async () => {
      const result = await highlightBlocks(
        [
          { code: 'const a = 1;', lang: 'ts' },
          { code: 'echo hi', lang: 'bash' },
        ],
        'dark',
      );

      expect(
        result.map((highlighted) => highlighted?.tokens[0]?.[0]?.content),
      ).toStrictEqual(['ts:plastic:const a = 1;', 'bash:plastic:echo hi']);
    });

    it('light なら one-light、dark なら plastic で描く', async () => {
      await highlightBlocks([{ code: 'a', lang: 'ts' }], 'light');
      await highlightBlocks([{ code: 'a', lang: 'ts' }], 'dark');

      expect(vi.mocked(highlightCode).mock.calls).toStrictEqual([
        ['a', 'ts', 'one-light'],
        ['a', 'ts', 'plastic'],
      ]);
    });
  });

  describe('異常系', () => {
    it('101 個のブロックは、どれもハイライトせずに null を返す', async () => {
      const blocks = Array.from({ length: 101 }, () => ({
        code: '',
        lang: 'ts',
      }));

      const result = await highlightBlocks(blocks, 'dark');

      expect(result).toHaveLength(101);
      expect(result.every((highlighted) => highlighted === null)).toBe(true);
      expect(highlightCode).not.toHaveBeenCalled();
    });

    it('コードの長さの合計が 200,000 字を超えると、どれもハイライトせずに null を返す', async () => {
      const result = await highlightBlocks(
        [
          { code: 'a'.repeat(100_000), lang: 'ts' },
          { code: 'a'.repeat(100_001), lang: 'ts' },
        ],
        'dark',
      );

      expect(result).toStrictEqual([null, null]);
      expect(highlightCode).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('許していない言語は text として描く', async () => {
      await highlightBlocks([{ code: 'x', lang: 'brainfuck' }], 'dark');

      expect(highlightCode).toHaveBeenCalledExactlyOnceWith(
        'x',
        'text',
        'plastic',
      );
    });

    it('100 個のブロックまではハイライトする', async () => {
      const blocks = Array.from({ length: 100 }, () => ({
        code: '',
        lang: 'ts',
      }));

      const result = await highlightBlocks(blocks, 'dark');

      expect(result.every((highlighted) => highlighted !== null)).toBe(true);
    });

    it('コードの長さの合計が 200,000 字ちょうどならハイライトする', async () => {
      const result = await highlightBlocks(
        [
          { code: 'a'.repeat(100_000), lang: 'ts' },
          { code: 'a'.repeat(100_000), lang: 'ts' },
        ],
        'dark',
      );

      expect(result.every((highlighted) => highlighted !== null)).toBe(true);
    });
  });
});
