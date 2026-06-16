import { type NextRequest, NextResponse } from 'next/server';

import { sendPushNotification } from '@/features/push-notification/interface/commands';
import { enrichArticleMetadata } from '@/features/reading-list/application/enrich-articles';
import { syncArticles } from '@/features/reading-list/application/sync-articles';
import { isAuthorizedCronRequest } from '@/shared/auth/verify-cron-request';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { newArticles, updatedArticles, failedSources } = await syncArticles();
  const { enrichedArticles } = await enrichArticleMetadata();

  const readingListUrl = 'https://www.k8o.me/reading-list';
  // 同日のリトライで結果カウントが変わっても重複通知しないよう、dedupe は日付のみで行う
  const today = new Date().toISOString().slice(0, 10);
  const dedupeKey = `readings:${today}`;
  try {
    if (failedSources.length > 0) {
      // 失敗したソース名は内部情報のため公開通知には含めず、admin ログにのみ残す
      console.warn('フィード取得に失敗したソース:', failedSources);
      await sendPushNotification({
        kind: 'readings_updated',
        title: 'フィード取得失敗',
        body: `${newArticles}件追加、${updatedArticles}件更新（${failedSources.length}件のソースで失敗）`,
        url: readingListUrl,
        dedupeKey,
      });
    } else {
      await sendPushNotification({
        kind: 'readings_updated',
        title: 'フィード取得完了',
        body: `${newArticles}件追加、${updatedArticles}件更新`,
        url: readingListUrl,
        dedupeKey,
      });
    }
  } catch (error) {
    console.error('プッシュ通知の送信に失敗しました:', error);
  }

  return NextResponse.json({
    ok: failedSources.length === 0,
    newArticles,
    updatedArticles,
    enrichedArticles,
    failedSources,
  });
}
