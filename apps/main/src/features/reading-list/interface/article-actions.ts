'use server';

import { revalidatePath } from 'next/cache';

import { generateAndSaveSummary } from '../application/summarize-article';

type ActionResult = {
  summary?: string;
  error?: string;
};

// 公開ページから呼ばれる。認証は無いが、生成前に DB で試行回数を予約するため、
// 並列リクエストでも1記事あたりの生成は MAX_SUMMARY_ATTEMPTS 回が上限になる。
export async function generateArticleSummary(
  id: number,
): Promise<ActionResult> {
  // 記事 ID は正の整数（autoincrement）。負値や 0 もここで弾く
  if (!Number.isInteger(id) || id <= 0) {
    return { error: '不正なIDです' };
  }

  const result = await generateAndSaveSummary(id);
  if (result.error !== undefined) {
    // 上限到達であきらめた記事は、一覧を再検証して「説明文で確定」状態に切り替える
    // （以降は生成を試みず「生成中…」を繰り返さない）。失敗継続中は再検証しない
    if (result.gaveUp === true) {
      revalidatePath('/reading-list');
    }
    return { error: result.error };
  }

  revalidatePath('/reading-list');
  return result.summary === null ? {} : { summary: result.summary };
}
