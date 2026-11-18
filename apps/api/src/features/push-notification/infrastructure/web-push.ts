import { encryptPushPayload } from './payload-encryption';
import type { RecipientKeys } from './payload-encryption';
import { generateVapidHeaders } from './vapid';
import type { VapidConfig } from './vapid';

type Subscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

// importKey の DataError をそのまま投げないのは、VAPID の鍵の誤りも同じ例外になり、
// 呼び出し側が購読ごとの失敗と取り違えて全購読を消してしまうため
export class InvalidSubscriptionKeysError extends Error {
  constructor() {
    super('購読の鍵を読み込めません');
    this.name = 'InvalidSubscriptionKeysError';
  }
}

export class WebPushError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'WebPushError';
    this.status = status;
  }
}

const UNCOMPRESSED_P256_KEY_LENGTH = 65;
const UNCOMPRESSED_POINT_PREFIX = 0x04;
const MIN_AUTH_SECRET_LENGTH = 16;
const MAX_AUTH_SECRET_LENGTH = 32;
const PUSH_TIMEOUT_MS = 10_000;

const decodeOrNull = (str: string): Uint8Array<ArrayBuffer> | null => {
  try {
    return Uint8Array.fromBase64(str, { alphabet: 'base64url' });
  } catch {
    return null;
  }
};

export async function importSubscriptionKeys(
  keys: Subscription['keys'],
): Promise<RecipientKeys | null> {
  const publicKeyBytes = decodeOrNull(keys.p256dh);
  const authSecret = decodeOrNull(keys.auth);
  // importKey は非圧縮以外の形の点も受け付けるが、RFC 8291 の鍵は非圧縮の形に限られる
  if (
    publicKeyBytes?.length !== UNCOMPRESSED_P256_KEY_LENGTH ||
    publicKeyBytes[0] !== UNCOMPRESSED_POINT_PREFIX ||
    authSecret === null ||
    authSecret.length < MIN_AUTH_SECRET_LENGTH ||
    authSecret.length > MAX_AUTH_SECRET_LENGTH
  ) {
    return null;
  }
  try {
    const publicKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    );
    return { publicKey, publicKeyBytes, authSecret };
  } catch (error) {
    // 鍵の中身による失敗（DataError）だけを読めない鍵とする。実行環境の失敗まで null にすると、
    // 送信側がすべての購読を消してしまう
    if (error instanceof DOMException && error.name === 'DataError') {
      return null;
    }
    throw error;
  }
}

export async function sendWebPush(
  subscription: Subscription,
  payload: string,
  vapid: VapidConfig,
): Promise<Response> {
  const recipient = await importSubscriptionKeys(subscription.keys);
  if (recipient === null) {
    throw new InvalidSubscriptionKeysError();
  }

  const body = await encryptPushPayload(payload, recipient);
  const vapidHeaders = await generateVapidHeaders(subscription.endpoint, vapid);

  // redirect: 'manual' でリダイレクト追従を無効化し、allowlist 済みホスト以外へ
  // 到達しないようにする(Push サービスの open redirect 等への多層防御)。
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      TTL: '86400',
      ...vapidHeaders,
    },
    body,
    redirect: 'manual',
    signal: AbortSignal.timeout(PUSH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new WebPushError(
      response.status,
      `Push failed: ${response.status} ${await response.text()}`,
    );
  }

  return response;
}
