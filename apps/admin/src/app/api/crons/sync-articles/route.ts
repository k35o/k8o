import { type NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/services/push-notification/push-notification';
import { syncArticles } from '@/services/reading-list/sync-articles';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { newArticles, updatedArticles, failedSources } = await syncArticles();

  const readingListUrl = 'https://www.k8o.me/reading-list';
  try {
    if (failedSources.length > 0) {
      await sendPushNotification(
        'フィード取得失敗',
        `${newArticles}件追加、${updatedArticles}件更新（失敗: ${failedSources.join(', ')}）`,
        readingListUrl,
      );
    } else {
      await sendPushNotification(
        'フィード取得完了',
        `${newArticles}件追加、${updatedArticles}件更新`,
        readingListUrl,
      );
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
