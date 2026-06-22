import { db } from '@repo/database';
import { eq } from 'drizzle-orm';

import { summarizeArticle } from '../infrastructure/summarize';
import { MAX_SUMMARY_ATTEMPTS } from './summary-policy';

type Result = {
  summary: string | null;
  error?: string;
  // 失敗上限に達し、以降は生成をあきらめた（説明文で確定）ことを表す
  gaveUp?: boolean;
};

export async function generateAndSaveSummary(id: number): Promise<Result> {
  const article = await db.query.articles.findFirst({
    columns: { id: true, url: true, summary: true, summaryAttempts: true },
    where: eq(db._schema.articles.id, id),
  });

  if (article === undefined) {
    return { summary: null, error: '記事が見つかりません' };
  }
  if (article.summary !== null) {
    return { summary: article.summary };
  }
  // すでに上限まで失敗している記事は再生成しない（無駄な fetch / LLM 呼び出しを止める）
  if (article.summaryAttempts >= MAX_SUMMARY_ATTEMPTS) {
    return { summary: null, gaveUp: true };
  }

  const summary = await summarizeArticle(article.url);
  if (summary === null) {
    // 失敗を記録して無限リトライを防ぐ。上限に達したらこの記事は以降あきらめる
    const attempts = article.summaryAttempts + 1;
    await db
      .update(db._schema.articles)
      .set({
        summaryAttempts: db._utils.increment(
          db._schema.articles.summaryAttempts,
        ),
      })
      .where(eq(db._schema.articles.id, id));
    return {
      summary: null,
      error: '要約の生成に失敗しました',
      gaveUp: attempts >= MAX_SUMMARY_ATTEMPTS,
    };
  }

  await db
    .update(db._schema.articles)
    .set({ summary })
    .where(eq(db._schema.articles.id, id));

  return { summary };
}
