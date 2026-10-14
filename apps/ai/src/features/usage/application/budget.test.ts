import { describe, expect, it } from 'vitest';

import { monthStartIso } from './budget';

describe('monthStartIso', () => {
  describe('正常系', () => {
    it('UTC の当月1日 00:00 を返す', () => {
      expect(monthStartIso(Date.parse('2026-10-14T05:30:00.000Z'))).toBe(
        '2026-10-01T00:00:00.000Z',
      );
    });
  });

  describe('エッジケース', () => {
    it('月初ちょうどはその月に、その1ミリ秒前は前の月に数える', () => {
      expect(monthStartIso(Date.parse('2026-10-01T00:00:00.000Z'))).toBe(
        '2026-10-01T00:00:00.000Z',
      );
      expect(monthStartIso(Date.parse('2026-09-30T23:59:59.999Z'))).toBe(
        '2026-09-01T00:00:00.000Z',
      );
    });

    it('12月から1月へ年をまたぐ', () => {
      expect(monthStartIso(Date.parse('2026-12-31T23:59:59.999Z'))).toBe(
        '2026-12-01T00:00:00.000Z',
      );
      expect(monthStartIso(Date.parse('2027-01-01T00:00:00.000Z'))).toBe(
        '2027-01-01T00:00:00.000Z',
      );
    });

    it('日本時間では翌月でも、UTC でまだ前の月なら前の月に数える', () => {
      expect(monthStartIso(Date.parse('2026-10-31T16:00:00.000Z'))).toBe(
        '2026-10-01T00:00:00.000Z',
      );
    });
  });
});
