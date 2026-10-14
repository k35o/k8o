import { describe, expect, it } from 'vitest';

import { toolFromSegment } from './tool-from-segment';

describe('toolFromSegment', () => {
  describe('正常系', () => {
    it.each([
      ['/ のページ', null, 'ui'],
      ['スライド', 'slides', 'slides'],
      ['チャット', 'chat', 'chat'],
    ] as const)(
      '%sにいるなら、そのツールを現在地にする',
      (_label, segment, tool) => {
        expect(toolFromSegment(segment)).toBe(tool);
      },
    );
  });

  describe('エッジケース', () => {
    it('ツールではないセグメントなら、どのツールも現在地にしない', () => {
      expect(toolFromSegment('settings')).toBeNull();
    });
  });
});
