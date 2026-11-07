import { describe, expect, it } from 'vitest';

import { highlightCode } from './tokenize.ts';

describe('highlightCode (server)', () => {
  describe('正常系', () => {
    it.each([
      { theme: 'one-light', color: '#5a5a60' },
      { theme: 'plastic', color: '#939aa7' },
    ] as const)(
      '$theme のコメントは 4.5:1 に届く色 $color に差し替えて出す',
      async ({ theme, color }) => {
        const result = await highlightCode('// note', 'ts', theme);

        expect(result.tokens.flat().map((token) => token.color)).toContain(
          color,
        );
      },
    );
  });
});
