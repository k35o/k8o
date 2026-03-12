import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/services/push-notification/push-notification';
import { syncArticles } from '@/services/reading-list/sync-articles';

export async function GET(req: NextRequest) {
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env['CRON_SECRET']}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { newArticles, failedSources } = await syncArticles();

  if (newArticles > 0) {
    revalidatePath('/reading-list');
  }

  const readingListUrl = 'https://www.k8o.me/reading-list';
  try {
    if (failedSources.length > 0) {
      await sendPushNotification(
        'フィード取得失敗',
        `${failedSources.join(', ')} の取得に失敗しました`,
        readingListUrl,
      );
    } else {
      await sendPushNotification(
        'フィード取得完了',
        `${newArticles}件の新しい記事を追加しました`,
        readingListUrl,
      );
    }
  } catch (error) {
    console.error('プッシュ通知の送信に失敗しました:', error);
  }

  return NextResponse.json({
    ok: failedSources.length === 0,
    newArticles,
    failedSources,
  });
}
