import { mapWithConcurrency } from '@repo/helpers/array/map-with-concurrency';
import { NINETY_DAYS_MS } from '@repo/helpers/date/duration';

import { summarizeArticle } from '../infrastructure/article-summarizer';
import {
  countSummaryProgress,
  findSummaryTargets,
  releaseSummaryAttempt,
  reserveSummaryAttempt,
  saveArticleSummary,
} from '../infrastructure/reading-list-repository';
import type {
  SummaryProgress,
  SummaryTarget,
} from '../infrastructure/reading-list-repository';
import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

const SUMMARY_LIMIT = 60;
const SUMMARY_CONCURRENCY = 4;

export type SummarizeResult = {
  summarizedArticles: number;
  failedSummaries: number;
  summaryAborted: boolean;
};

type ArticleOutcome = 'summarized' | 'failed' | 'skipped';

const ninetyDaysAgo = (): string =>
  new Date(Date.now() - NINETY_DAYS_MS).toISOString();

const releaseQuietly = async (article: SummaryTarget): Promise<void> => {
  try {
    await releaseSummaryAttempt(article.id, article.summaryAttempts);
  } catch (error) {
    console.error(`記事 ${article.id} の試行を戻せませんでした:`, error);
  }
};

export async function summarizeArticles(
  deadline: number,
): Promise<SummarizeResult> {
  const targets = await findSummaryTargets(
    ninetyDaysAgo(),
    MAX_SUMMARY_ATTEMPTS,
    SUMMARY_LIMIT,
  );

  let aborted = false;
  const outcomes = await mapWithConcurrency(
    targets,
    SUMMARY_CONCURRENCY,
    async (article): Promise<ArticleOutcome> => {
      // 予約してから関数が打ち切られると、結果が残らないまま試行だけが減る。
      // 締め切りを過ぎたら予約せずに翌日へ回す
      if (aborted || Date.now() >= deadline) {
        return 'skipped';
      }
      let reserved = false;
      try {
        reserved = await reserveSummaryAttempt(
          article.id,
          article.summaryAttempts,
        );
        if (!reserved) {
          return 'skipped';
        }
        const outcome = await summarizeArticle(article);
        if (outcome.kind === 'failed') {
          console.warn(
            `記事 ${article.id} を要約できませんでした: ${outcome.reason}`,
          );
          return 'failed';
        }
        return (await saveArticleSummary(article.id, outcome.summary))
          ? 'summarized'
          : 'skipped';
      } catch (error) {
        // 鍵の不備・支出上限・API や DB の障害は記事のせいではないので、試行を戻して
        // この回の要約をやめる（すべての記事の試行を使い切るのを防ぐ）
        aborted = true;
        console.error('要約の生成を中断しました:', error);
        if (reserved) {
          await releaseQuietly(article);
        }
        return 'skipped';
      }
    },
  );

  return {
    summarizedArticles: outcomes.filter((o) => o === 'summarized').length,
    failedSummaries: outcomes.filter((o) => o === 'failed').length,
    summaryAborted: aborted,
  };
}

export const getSummaryProgress = (): Promise<SummaryProgress> =>
  countSummaryProgress(ninetyDaysAgo(), MAX_SUMMARY_ATTEMPTS);
