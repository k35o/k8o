import type { BrowserSupportSyncTrigger } from '@repo/database/schema';

// push-notification は別 feature だが、通知の配線は Next.js 境界(interface)の責務と
// して interface 間 import を許容する。application 層は SyncNotifier に依存するだけ。
import { sendPushNotification } from '@/features/push-notification/interface/commands';

import { syncBrowserSupport } from '../application/sync-browser-support';
import type { SyncSummary } from '../application/sync-browser-support';

// 警報のリンク先も公開側に寄せる。/browser-support は鮮度(データ基準日)を常時表示
// しており、admin のデプロイ URL に依存せず状況を確認できる。
const BROWSER_SUPPORT_URL = 'https://k8o.me/browser-support';

export function runBrowserSupportSync(
  trigger: BrowserSupportSyncTrigger,
  { force = false }: { force?: boolean } = {},
): Promise<SyncSummary> {
  return syncBrowserSupport({
    trigger,
    force,
    notify: async (notification) => {
      try {
        await sendPushNotification({
          kind:
            notification.kind === 'update'
              ? 'browser_support_updated'
              : 'browser_support_alert',
          title: notification.title,
          body: notification.body,
          url: BROWSER_SUPPORT_URL,
          dedupeKey: notification.dedupeKey,
        });
      } catch (error) {
        // 通知失敗で同期を止めない。基準はDBに置換済みなので二重取り込みは起きない。
        console.error('プッシュ通知の送信に失敗しました:', error);
      }
    },
  });
}

export type { SyncSummary } from '../application/sync-browser-support';
