'use server';

import { isAllowedPushEndpoint } from '@repo/helpers/push-endpoint';
import * as z from 'zod/mini';

import { configureZod } from '@/shared/validation/zod';

import { isValidPushKeys } from '../application/push-keys';
import { subscribePush, unsubscribePush } from '../application/subscribe';

configureZod();

const MAX_ENDPOINT_LENGTH = 2048;
const MAX_KEY_LENGTH = 256;

const subscriptionSchema = z.object({
  endpoint: z.string().check(z.minLength(1), z.maxLength(MAX_ENDPOINT_LENGTH)),
  keys: z.object({
    p256dh: z.string().check(z.minLength(1), z.maxLength(MAX_KEY_LENGTH)),
    auth: z.string().check(z.minLength(1), z.maxLength(MAX_KEY_LENGTH)),
  }),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().check(z.minLength(1), z.maxLength(MAX_ENDPOINT_LENGTH)),
  auth: z.string().check(z.minLength(1), z.maxLength(MAX_KEY_LENGTH)),
});

type SubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type UnsubscribePayload = {
  endpoint: string;
  auth: string;
};

type ActionResult = { success: true } | { success: false; message: string };

export const subscribePushAction = async (
  payload: SubscriptionPayload,
): Promise<ActionResult> => {
  const validated = subscriptionSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, message: '購読情報が不正です' };
  }

  // SSRF 対策: endpoint は https かつ Push サービスホストの allowlist に限定する
  if (!isAllowedPushEndpoint(validated.data.endpoint)) {
    return {
      success: false,
      message: '許可されていない通知エンドポイントです',
    };
  }

  if (!isValidPushKeys(validated.data.keys.p256dh, validated.data.keys.auth)) {
    return { success: false, message: '購読鍵の形式が不正です' };
  }

  try {
    await subscribePush({
      endpoint: validated.data.endpoint,
      p256dh: validated.data.keys.p256dh,
      auth: validated.data.keys.auth,
    });
    return { success: true };
  } catch (error) {
    console.error('購読の登録に失敗しました:', error);
    return { success: false, message: '購読の登録に失敗しました' };
  }
};

export const unsubscribePushAction = async (
  payload: UnsubscribePayload,
): Promise<ActionResult> => {
  // endpoint だけでなく auth(共有秘密)も検証し、削除時に所有者確認する（IDOR 対策）
  const validated = unsubscribeSchema.safeParse(payload);
  if (!validated.success) {
    return { success: false, message: 'エンドポイントが不正です' };
  }

  try {
    await unsubscribePush(validated.data);
    return { success: true };
  } catch (error) {
    console.error('購読の解除に失敗しました:', error);
    return { success: false, message: '購読の解除に失敗しました' };
  }
};
