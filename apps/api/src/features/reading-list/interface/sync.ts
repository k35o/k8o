import { revalidateMainCache } from '../../../shared/cache/revalidate-main';
// push-notification は別 feature だが、通知の配線は HTTP 境界(interface)の責務と
// して interface 間 import を許容する（browser-support/interface/sync.ts と同じ扱い）。
import { sendPushNotification } from '../../push-notification/interface/commands';
import { enrichArticleMetadata } from '../application/enrich-articles';
import { summarizeArticles } from '../application/summarize-articles';
import { syncArticles } from '../application/sync-articles';

const READING_LIST_URL = 'https://k8o.me/reading-list';
// 関数の上限（Vercel Hobby で300秒）から、締め切りの直前に始めた1件（本文の取得と生成で
// 最大約70秒）と、再検証・通知の分を残す
const SUMMARY_DEADLINE_MS = 180_000;

export type ArticleSyncSummary = {
  newArticles: number;
  updatedArticles: number;
  enrichedArticles: number;
  summarizedArticles: number;
  failedSummaries: number;
  summaryAborted: boolean;
  failedSources: string[];
};

export async function runArticleSync(): Promise<ArticleSyncSummary> {
  const startedAt = Date.now();
  const { newArticles, updatedArticles, failedSources } = await syncArticles();
  const { enrichedArticles } = await enrichArticleMetadata();
  const { summarizedArticles, failedSummaries, summaryAborted } =
    await summarizeArticles(startedAt + SUMMARY_DEADLINE_MS).catch(
      (error: unknown) => {
        // 記事の取り込みは済んでいるので、要約の失敗で再検証と通知を止めない
        console.error('記事の要約に失敗しました:', error);
        return {
          summarizedArticles: 0,
          failedSummaries: 0,
          summaryAborted: true,
        };
      },
    );

  // main の reading-list 一覧は db-content タグ付きキャッシュ（cacheLife('hours')）の
  // ため、同期のたびに再検証して最大1時間の古い表示を防ぐ
  await revalidateMainCache();

  // 同日のリトライで結果カウントが変わっても重複通知しないよう、dedupe は日付のみで行う
  const today = new Date().toISOString().slice(0, 10);
  const dedupeKey = `readings:${today}`;
  try {
    if (failedSources.length > 0) {
      // 失敗したソース名は内部情報のため公開通知には含めず、api のログにのみ残す
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

  return {
    newArticles,
    updatedArticles,
    enrichedArticles,
    summarizedArticles,
    failedSummaries,
    summaryAborted,
    failedSources,
  };
}
