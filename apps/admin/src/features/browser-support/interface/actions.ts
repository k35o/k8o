'use server';

import { verifySession } from '@repo/auth-shell/verify-session';
import { updateTag } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { BROWSER_SUPPORT_CACHE_TAG } from '@/shared/cache/cache-tags';

import { runBrowserSupportSync } from './sync';

type SyncActionState = ActionState & {
  result?: string;
  reachedCount?: number;
  statusChanges?: number;
};

export async function syncBrowserSupportAction(): Promise<SyncActionState> {
  await verifySession();

  try {
    // 手動同期は復旧手段: 同一バージョンでも強制再取り込みする(壊れた active の
    // 回復や、同一タグのままのアセット差し替えを拾い直す用途)。
    const summary = await runBrowserSupportSync('manual', { force: true });
    updateTag(BROWSER_SUPPORT_CACHE_TAG);
    if (
      summary.result === 'fetch_failed' ||
      summary.result === 'validation_failed' ||
      summary.result === 'db_failed'
    ) {
      return {
        error: `同期に失敗しました(${summary.result}): ${summary.detail ?? ''}`,
      };
    }
    return {
      result: summary.result,
      reachedCount: summary.newlyCount + summary.widelyCount,
      statusChanges: summary.statusChangeCount,
    };
  } catch {
    return { error: 'ブラウザ対応状況の同期に失敗しました' };
  }
}
