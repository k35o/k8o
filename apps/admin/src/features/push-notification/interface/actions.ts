'use server';

import { revalidatePath } from 'next/cache';

import type { ActionState } from '@/shared/actions/action-state';
import { verifySession } from '@/shared/auth/verify-session';

import { sendManualPush } from '../infrastructure/push-notification';

export type ManualPushActionState = ActionState & {
  succeeded?: number;
  failed?: number;
};

type ManualPushInput = {
  title: string;
  body: string;
  url: string;
};

export async function sendManualPushAction(
  input: ManualPushInput,
): Promise<ManualPushActionState> {
  await verifySession();

  if (input.title.trim() === '' || input.body.trim() === '') {
    return { error: 'タイトルと本文は必須です' };
  }

  const trimmedUrl = input.url.trim();
  const url =
    trimmedUrl === '' || !URL.canParse(trimmedUrl)
      ? 'https://k8o.me'
      : trimmedUrl;

  try {
    const { succeeded, failed } = await sendManualPush({
      title: input.title,
      body: input.body,
      url,
    });
    revalidatePath('/notifications');
    return { success: true, succeeded, failed };
  } catch {
    return { error: '送信に失敗しました（VAPID 設定を確認してください）' };
  }
}
