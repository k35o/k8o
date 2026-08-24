// push-notification は別 feature だが、通知の配線は Next.js 境界(interface)の責務と
// して interface 間 import を許容する（browser-support/interface/sync.ts と同じ扱い）。
import { sendPushNotification } from '@/features/push-notification/interface/commands';
import { revalidateMainCache } from '@/shared/cache/revalidate-main';

import { enrichArticleMetadata } from '../application/enrich-articles';
import { syncArticles } from '../application/sync-articles';

const READING_LIST_URL = 'https://www.k8o.me/reading-list';

export type ArticleSyncSummary = {
  newArticles: number;
  updatedArticles: number;
  enrichedArticles: number;
  failedSources: string[];
};

// cron と手動同期が共用する同期ユースケース。通知は cron のみ（手動同期は結果が
// そのまま画面に出るため送らない）。
export async function runArticleSync({
  notify,
}: {
  notify: boolean;
}): Promise<ArticleSyncSummary> {
  const { newArticles, updatedArticles, failedSources } = await syncArticles();
  const { enrichedArticles } = await enrichArticleMetadata();

  // main の reading-list 一覧は db-content タグ付きキャッシュ（cacheLife('hours')）の
  // ため、同期のたびに再検証して最大1時間の古い表示を防ぐ
  await revalidateMainCache();

  if (notify) {
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
          url: READING_LIST_URL,
          dedupeKey,
        });
      } else {
        await sendPushNotification({
          kind: 'readings_updated',
          title: 'フィード取得完了',
          body: `${newArticles}件追加、${updatedArticles}件更新`,
          url: READING_LIST_URL,
          dedupeKey,
        });
      }
    } catch (error) {
      // 通知失敗で同期を失敗にしない（記事はDBに反映済み）。
      console.error('プッシュ通知の送信に失敗しました:', error);
    }
  }

  return { newArticles, updatedArticles, enrichedArticles, failedSources };
}
