import { countSummaryProgress } from '../infrastructure/reading-list-repository';
import type { SummaryProgress } from '../infrastructure/reading-list-repository';
import { MAX_SUMMARY_ATTEMPTS, summaryWindowStart } from './summary-policy';

export const getSummaryProgress = (): Promise<SummaryProgress> =>
  countSummaryProgress(summaryWindowStart(), MAX_SUMMARY_ATTEMPTS);
