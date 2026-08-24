import {
  findArticleForSummary,
  findArticleSummary,
  reserveSummaryAttempt,
  saveArticleSummary,
} from '../infrastructure/article-repository';
import { summarizeArticle } from '../infrastructure/summarize';
import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

type Result = {
  summary: string | null;
  error?: string;
  // 試行上限に達し、以降は生成をあきらめた（説明文で確定）ことを表す
  gaveUp?: boolean;
};

export async function generateAndSaveSummary(id: number): Promise<Result> {
  const article = await findArticleForSummary(id);

  if (article === undefined) {
    return { summary: null, error: '記事が見つかりません' };
  }
  if (article.summary !== null) {
    return { summary: article.summary };
  }
  // すでに上限まで試行した記事は再生成しない（無駄な fetch / LLM 呼び出しを止める）
  if (article.summaryAttempts >= MAX_SUMMARY_ATTEMPTS) {
    return { summary: null, gaveUp: true };
  }

  // read-then-act だと並列リクエストで生成が多重実行されるため、
  // 生成前に試行回数を予約し、予約できたリクエストだけが生成に進む
  const reserved = await reserveSummaryAttempt(id, MAX_SUMMARY_ATTEMPTS);
  if (!reserved) {
    // 並列リクエストが先に summary を保存したか、試行上限に達している
    const latest = await findArticleSummary(id);
    if (latest !== null) {
      return { summary: latest };
    }
    return { summary: null, gaveUp: true };
  }

  const summary = await summarizeArticle(article.url);
  if (summary === null) {
    // 失敗分は予約時の increment で記録済み。上限に達したらこの記事は以降あきらめる
    return {
      summary: null,
      error: '要約の生成に失敗しました',
      gaveUp: article.summaryAttempts + 1 >= MAX_SUMMARY_ATTEMPTS,
    };
  }

  await saveArticleSummary(id, summary);

  return { summary };
}
