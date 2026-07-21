'use server';

import { revalidatePath } from 'next/cache';

import { syncBrowserSupport } from '@/features/browser-support/application/sync-browser-support';
import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';

type SyncActionState = ActionState & {
  newFeatures?: number;
  statusChanges?: number;
};

export async function syncBrowserSupportAction(): Promise<SyncActionState> {
  await verifySession();

  try {
    const result = await syncBrowserSupport();
    revalidatePath('/browser-support');
    return {
      newFeatures: result.newFeatures.length,
      statusChanges: result.statusChanges.length,
    };
  } catch {
    return { error: 'ブラウザ対応状況の同期に失敗しました' };
  }
}
