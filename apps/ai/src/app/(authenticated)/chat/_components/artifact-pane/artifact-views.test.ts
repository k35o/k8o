import { describe, expect, it } from 'vitest';

import { artifactViewFor } from './artifact-views';

describe('artifactViewFor', () => {
  describe('正常系', () => {
    it.each([
      ['ui', 'preview'],
      ['ui', 'spec'],
      ['ui', 'tsx'],
      ['slides', 'preview'],
      ['slides', 'markdown'],
    ] as const)('%s に有るビュー（%s）は、そのまま出す', (kind, view) => {
      expect(artifactViewFor(kind, view)).toBe(view);
    });
  });

  describe('エッジケース', () => {
    it.each([
      ['ui', 'markdown'],
      ['slides', 'spec'],
      ['slides', 'tsx'],
    ] as const)(
      '%s に無いビュー（%s）は、プレビューとして出す',
      (kind, view) => {
        expect(artifactViewFor(kind, view)).toBe('preview');
      },
    );
  });
});
