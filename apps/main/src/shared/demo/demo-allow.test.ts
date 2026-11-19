import { describe, expect, it } from 'vitest';

import { toDemoAllow } from './demo-allow';

describe('toDemoAllow', () => {
  describe('正常系', () => {
    it('クリップボードの権限を、相手を書かない allow にする', () => {
      expect(toDemoAllow('clipboard-read clipboard-write')).toBe(
        'clipboard-read; clipboard-write',
      );
    });

    it('origin の無い文書に Wake Lock を渡すため、相手を * にする', () => {
      expect(toDemoAllow('screen-wake-lock')).toBe('screen-wake-lock *');
    });
  });

  describe('異常系', () => {
    it('決めた権限のほかは渡さない', () => {
      expect(toDemoAllow('camera clipboard-write microphone *')).toBe(
        'clipboard-write',
      );
      expect(toDemoAllow('camera')).toBeUndefined();
    });
  });

  describe('エッジケース', () => {
    it('権限を書かない例は allow を持たない', () => {
      expect(toDemoAllow(undefined)).toBeUndefined();
      expect(toDemoAllow('')).toBeUndefined();
    });
  });
});
