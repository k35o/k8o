import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { syncBrowserSupport } from '@/features/browser-support/application/sync-browser-support';
import { sendPushNotification } from '@/features/push-notification/interface/commands';
import { isAuthorizedCronRequest } from '@/shared/auth/verify-cron-request';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const { newFeatures, statusChanges } = await syncBrowserSupport();

    const hasChanges = newFeatures.length > 0 || statusChanges.length > 0;

    if (hasChanges) {
      const parts: string[] = [];
      const newlyCount = newFeatures.filter((f) => f.status === 'newly').length;
      const widelyCount = newFeatures.filter(
        (f) => f.status === 'widely',
      ).length;

      if (newlyCount > 0) {
        parts.push(`Newly: ${newlyCount}件`);
      }
      if (widelyCount > 0) {
        parts.push(`Widely: ${widelyCount}件`);
      }
      if (statusChanges.length > 0) {
        parts.push(`ステータス変更: ${statusChanges.length}件`);
      }

      try {
        // 同日のリトライで件数が変わっても重複通知しないよう、dedupe は日付のみで行う
        const today = new Date().toISOString().slice(0, 10);
        await sendPushNotification({
          kind: 'browser_support_updated',
          title: 'Browser Support更新',
          body: parts.join('、'),
          url: 'https://k8o.me/browser-support',
          dedupeKey: `browser-support:${today}`,
        });
      } catch (error) {
        console.error('プッシュ通知の送信に失敗しました:', error);
      }
    }

    return NextResponse.json({
      ok: true,
      newFeatures: newFeatures.length,
      statusChanges: statusChanges.length,
    });
  } catch (error) {
    console.error('ブラウザ対応状況の同期に失敗しました:', error);
    return NextResponse.json(
      { ok: false, error: 'sync failed' },
      { status: 500 },
    );
  }
}
