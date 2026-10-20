import { describe, expect, it } from 'vitest';

import { toolFromSegment } from './tool-from-segment';

describe('toolFromSegment', () => {
  describe('正常系', () => {
    it.each([
      ['チャット', 'chat', 'chat'],
      ['作ったもの', 'artifacts', 'artifacts'],
    ] as const)(
      '%sにいるなら、そのツールを現在地にする',
      (_label, segment, tool) => {
        expect(toolFromSegment(segment)).toBe(tool);
      },
    );
  });

  describe('エッジケース', () => {
    it.each([null, 'slides', 'settings'])(
      'ツールではないセグメント（%s）なら、どのツールも現在地にしない',
      (segment) => {
        expect(toolFromSegment(segment)).toBeNull();
      },
    );
  });
});
