import { describe, expect, it } from 'vitest';
import { getJstUtcEnd, getJstUtcStart } from './jst';

describe('GitHub contributions JST helpers', () => {
  it('converts JST date to UTC start and end', () => {
    const date = '2026-01-30';

    expect(getJstUtcStart(date)).toBe('2026-01-29T15:00:00.000Z');
    expect(getJstUtcEnd(date)).toBe('2026-01-30T14:59:59.999Z');
  });

  it('handles month boundary correctly', () => {
    const date = '2026-01-31';

    expect(getJstUtcStart(date)).toBe('2026-01-30T15:00:00.000Z');
    expect(getJstUtcEnd(date)).toBe('2026-01-31T14:59:59.999Z');
  });

  it('handles year boundary correctly', () => {
    const date = '2025-12-31';

    expect(getJstUtcStart(date)).toBe('2025-12-30T15:00:00.000Z');
    expect(getJstUtcEnd(date)).toBe('2025-12-31T14:59:59.999Z');
  });

  it('handles leap day correctly', () => {
    const date = '2024-02-29';

    expect(getJstUtcStart(date)).toBe('2024-02-28T15:00:00.000Z');
    expect(getJstUtcEnd(date)).toBe('2024-02-29T14:59:59.999Z');
  });
});
