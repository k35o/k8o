import { type NextRequest, NextResponse } from 'next/server';

import { sendPushNotification } from '@/features/push-notification/infrastructure/push-notification';
import { syncArticles } from '@/features/reading-list/application/sync-articles';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env['CRON_SECRET'];
  if (
    cronSecret === undefined ||
    cronSecret === '' ||
    req.headers.get('Authorization') !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { newArticles, updatedArticles, failedSources } = await syncArticles();

  const readingListUrl = 'https://www.k8o.me/reading-list';
  const today = new Date().toISOString().slice(0, 10);
  const dedupeKey = `readings:${today}:${newArticles}:${updatedArticles}:${failedSources.length}`;
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
    failedSources,
  });
}
