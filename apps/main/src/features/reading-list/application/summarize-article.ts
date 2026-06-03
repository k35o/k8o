import { db } from '@repo/database';
import { eq } from 'drizzle-orm';

import { summarizeArticle } from '../infrastructure/summarize';

type Result = {
  summary: string | null;
  error?: string;
};

/**
 * 記事の要約を生成して保存する。
 * 冪等：既に summary があれば生成せずそのまま返す（1記事につき生成は最大1回）。
 */
export async function generateAndSaveSummary(id: number): Promise<Result> {
  const article = await db.query.articles.findFirst({
    columns: { id: true, url: true, summary: true },
    where: eq(db._schema.articles.id, id),
  });

  if (article === undefined) {
    return { summary: null, error: '記事が見つかりません' };
  }
  if (article.summary !== null) {
    return { summary: article.summary };
  }

  const summary = await summarizeArticle(article.url);
  if (summary === null) {
    return { summary: null, error: '要約の生成に失敗しました' };
  }

  await db
    .update(db._schema.articles)
    .set({ summary })
    .where(eq(db._schema.articles.id, id));

  return { summary };
}
