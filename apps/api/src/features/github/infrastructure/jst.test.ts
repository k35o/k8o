import { describe, expect, it } from 'vitest';

import { getJstUtcEnd, getJstUtcStart } from './jst';

describe('日本時間の日付から UTC の範囲を作る', () => {
  describe('正常系', () => {
    it('日本時間のその日の始まりと終わりを UTC で返す', () => {
      expect(getJstUtcStart('2026-01-30')).toBe('2026-01-29T15:00:00.000Z');
      expect(getJstUtcEnd('2026-01-30')).toBe('2026-01-30T14:59:59.999Z');
    });
  });

  describe('エッジケース', () => {
    it('月末をまたぐ', () => {
      expect(getJstUtcStart('2026-01-31')).toBe('2026-01-30T15:00:00.000Z');
      expect(getJstUtcEnd('2026-01-31')).toBe('2026-01-31T14:59:59.999Z');
    });

    it('年末をまたぐ', () => {
      expect(getJstUtcStart('2025-12-31')).toBe('2025-12-30T15:00:00.000Z');
      expect(getJstUtcEnd('2025-12-31')).toBe('2025-12-31T14:59:59.999Z');
    });

    it('うるう日を扱う', () => {
      expect(getJstUtcStart('2024-02-29')).toBe('2024-02-28T15:00:00.000Z');
      expect(getJstUtcEnd('2024-02-29')).toBe('2024-02-29T14:59:59.999Z');
    });
  });
});
