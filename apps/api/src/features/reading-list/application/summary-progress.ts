import { countSummaryProgress } from '../infrastructure/reading-list-repository';
import type { SummaryProgress } from '../infrastructure/reading-list-repository';
import { readingWindowStart } from './reading-window';
import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

export const getSummaryProgress = (): Promise<SummaryProgress> =>
  countSummaryProgress(
    readingWindowStart(Date.now()).toISOString(),
    MAX_SUMMARY_ATTEMPTS,
  );
