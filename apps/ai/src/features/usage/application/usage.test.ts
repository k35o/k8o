import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
} from '../infrastructure/usage-repository';
import { isMonthlyBudgetExceeded, recordUsage, reserveUsage } from './usage';

vi.mock('server-only', () => ({}));
vi.mock('../infrastructure/usage-repository', () => ({
  insertUsageWithinLimits: vi.fn(),
  selectCostSinceMicroUsd: vi.fn(),
  updateUsageCost: vi.fn(),
}));

const now = Date.parse('2026-10-14T12:00:00.000Z');

const reservation = {
  app: 'agent',
  userId: 'u1',
  model: 'claude-sonnet-5-5',
  now,
} as const;

beforeEach(() => {
  vi.mocked(insertUsageWithinLimits).mockResolvedValue(7);
  vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(0);
  vi.mocked(updateUsageCost).mockResolvedValue();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('reserveUsage', () => {
  describe('正常系', () => {
    it('1時間あたりの上限と月の予算を条件に、モデルつきで利用の行を予約する', async () => {
      vi.stubEnv('AI_GENERATE_LIMIT_PER_HOUR', '5');

      await expect(reserveUsage(reservation)).resolves.toStrictEqual({
        ok: true,
        usageId: 7,
      });
      expect(insertUsageWithinLimits).toHaveBeenCalledExactlyOnceWith({
        app: 'agent',
        userId: 'u1',
        model: 'claude-sonnet-5-5',
        createdAt: '2026-10-14T12:00:00.000Z',
        sinceIso: '2026-10-14T11:00:00.000Z',
        limit: 5,
        monthStartIso: '2026-10-01T00:00:00.000Z',
        budgetMicroUsd: 100_000_000,
      });
    });
  });

  describe('異常系', () => {
    it('予約できず、当月の費用が予算に達していれば、予算を理由に断る', async () => {
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(100_000_000);

      await expect(reserveUsage(reservation)).resolves.toStrictEqual({
        ok: false,
        reason: 'budget',
      });
    });

    it('予約できず、当月の費用が予算に達していなければ、1時間あたりの上限を理由に断る', async () => {
      vi.mocked(insertUsageWithinLimits).mockResolvedValue(null);
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(99_999_999);

      await expect(reserveUsage(reservation)).resolves.toStrictEqual({
        ok: false,
        reason: 'rate-limit',
      });
    });
  });
});

describe('isMonthlyBudgetExceeded', () => {
  describe('正常系', () => {
    it('UTC の当月1日からの費用の合計を読む', async () => {
      await isMonthlyBudgetExceeded(now);

      expect(selectCostSinceMicroUsd).toHaveBeenCalledExactlyOnceWith(
        '2026-10-01T00:00:00.000Z',
      );
    });
  });

  describe('エッジケース', () => {
    it('合計が予算（$100）ちょうどなら超えたとみなす', async () => {
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(100_000_000);

      await expect(isMonthlyBudgetExceeded(now)).resolves.toBe(true);
    });

    it('予算まで1マイクロドル残っていれば超えていない', async () => {
      vi.mocked(selectCostSinceMicroUsd).mockResolvedValue(99_999_999);

      await expect(isMonthlyBudgetExceeded(now)).resolves.toBe(false);
    });
  });
});

describe('recordUsage', () => {
  describe('正常系', () => {
    it('予約した行に、トークン数の内訳とモデルの単価で数えた費用を書く', async () => {
      await recordUsage({
        usageId: 7,
        model: 'claude-opus-5-5',
        tokens: {
          inputTokens: 10_000,
          outputTokens: 1000,
          cacheReadTokens: 6000,
          cacheWriteTokens: 2000,
        },
      });

      expect(updateUsageCost).toHaveBeenCalledExactlyOnceWith({
        id: 7,
        inputTokens: 10_000,
        outputTokens: 1000,
        cacheReadTokens: 6000,
        cacheWriteTokens: 2000,
        costMicroUsd: 39_200,
      });
    });
  });
});
