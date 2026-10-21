import { describe, expect, it, vi } from 'vitest';

import { countSummaryProgress } from '../infrastructure/reading-list-repository';
import { getSummaryProgress } from './summary-progress';

vi.mock('../infrastructure/reading-list-repository', () => ({
  countSummaryProgress: vi.fn(),
}));

const NOW = new Date('2026-10-09T00:00:00.000Z');

describe('getSummaryProgress', () => {
  describe('正常系', () => {
    it('要約を選ぶときと同じ90日の窓と試行の上限で数える', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
      vi.mocked(countSummaryProgress).mockResolvedValue({
        unsummarized: 5,
        summaryGaveUp: 1,
      });

      await expect(getSummaryProgress()).resolves.toStrictEqual({
        unsummarized: 5,
        summaryGaveUp: 1,
      });
      expect(countSummaryProgress).toHaveBeenCalledWith(
        '2026-07-11T00:00:00.000Z',
        3,
      );
      vi.useRealTimers();
    });
  });
});
