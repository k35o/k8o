'use server';

import { revalidatePath } from 'next/cache';

import { syncBaseline } from '@/features/baseline/application/sync-baseline';
import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';

type SyncActionState = ActionState & {
  newFeatures?: number;
  statusChanges?: number;
};

export async function syncBaselineAction(): Promise<SyncActionState> {
  await verifySession();

  try {
    const result = await syncBaseline();
    revalidatePath('/baseline');
    return {
      newFeatures: result.newFeatures.length,
      statusChanges: result.statusChanges.length,
    };
  } catch {
    return { error: 'Baselineの同期に失敗しました' };
  }
}
