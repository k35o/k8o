import { NINETY_DAYS_MS } from '@repo/helpers/date/duration';

// 本文が取れない記事などに、日次の同期のたびに費用をかけ続けないための上限
export const MAX_SUMMARY_ATTEMPTS = 3;

export const summaryWindowStart = (): string =>
  new Date(Date.now() - NINETY_DAYS_MS).toISOString();
