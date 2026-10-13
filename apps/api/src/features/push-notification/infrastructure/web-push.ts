type Subscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type VapidOptions = {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
};

type ClientKeys = {
  publicKey: CryptoKey;
  publicKeyBytes: Uint8Array<ArrayBuffer>;
  authSecret: Uint8Array<ArrayBuffer>;
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

function isCryptoKeyPair(key: CryptoKey | CryptoKeyPair): key is CryptoKeyPair {
  return 'privateKey' in key && 'publicKey' in key;
}

function utf8(str: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(str));
}

const decodeOrNull = (str: string): Uint8Array<ArrayBuffer> | null => {
  try {
    return base64UrlDecode(str);
  } catch {
    return null;
  }
};

export async function importSubscriptionKeys(
  keys: Subscription['keys'],
): Promise<ClientKeys | null> {
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
  vapid: VapidOptions,
): Promise<Response> {
  const client = await importSubscriptionKeys(subscription.keys);
  if (client === null) {
    throw new InvalidSubscriptionKeysError();
  }

  const payloadBytes = utf8(payload);

  const keyResult = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );
  if (!isCryptoKeyPair(keyResult)) {
    throw new Error('Expected CryptoKeyPair');
  }
  const localKeyPair = keyResult;

  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: client.publicKey },
    localKeyPair.privateKey,
    256,
  );

  const localPublicKeyExport = await crypto.subtle.exportKey(
    'raw',
    localKeyPair.publicKey,
  );
  if (!(localPublicKeyExport instanceof ArrayBuffer)) {
    throw new Error('Expected ArrayBuffer');
  }
  const localPublicKey = new Uint8Array(localPublicKeyExport);

  const { contentEncryptionKey, nonce, salt } = await deriveEncryptionKeys(
    sharedSecret,
    client.authSecret,
    localPublicKey,
    client.publicKeyBytes,
  );

  const encrypted = await encryptPayload(
    payloadBytes,
    contentEncryptionKey,
    nonce,
  );
  const body = buildEncryptedBody(localPublicKey, { encrypted, salt });

  const vapidHeaders = await generateVapidHeaders(
    subscription.endpoint,
    vapid.vapidSubject,
    vapid.vapidPublicKey,
    vapid.vapidPrivateKey,
  );

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

async function deriveEncryptionKeys(
  sharedSecret: ArrayBuffer,
  authSecret: Uint8Array<ArrayBuffer>,
  localPublicKey: Uint8Array<ArrayBuffer>,
  clientPublicKey: Uint8Array<ArrayBuffer>,
): Promise<{
  contentEncryptionKey: CryptoKey;
  nonce: Uint8Array<ArrayBuffer>;
  salt: Uint8Array<ArrayBuffer>;
}> {
  const info = concatBytes(
    utf8('WebPush: info\0'),
    clientPublicKey,
    localPublicKey,
  );

  const ikm = await hkdf(authSecret, new Uint8Array(sharedSecret), info, 32);

  const keyInfo = utf8('Content-Encoding: aes128gcm\0');
  const nonceInfo = utf8('Content-Encoding: nonce\0');

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyBytes = await hkdf(salt, ikm, keyInfo, 16);
  const nonceBytes = await hkdf(salt, ikm, nonceInfo, 12);

  const contentEncryptionKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  );

  return {
    contentEncryptionKey,
    nonce: nonceBytes,
    salt,
  };
}

async function encryptPayload(
  payload: Uint8Array<ArrayBuffer>,
  key: CryptoKey,
  nonce: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const paddedPayload = concatBytes(payload, new Uint8Array([2]));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    paddedPayload,
  );

  return new Uint8Array(encrypted);
}

export function buildEncryptedBody(
  localPublicKey: Uint8Array<ArrayBuffer>,
  {
    encrypted,
    salt,
  }: { encrypted: Uint8Array<ArrayBuffer>; salt: Uint8Array<ArrayBuffer> },
): Uint8Array<ArrayBuffer> {
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);

  const idlen = new Uint8Array([65]);

  return concatBytes(salt, rs, idlen, localPublicKey, encrypted);
}

async function generateVapidHeaders(
  endpoint: string,
  subject: string,
  publicKey: string,
  privateKey: string,
): Promise<{ Authorization: string; 'Crypto-Key': string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const privateKeyBytes = base64UrlDecode(privateKey);
  const publicKeyBytes = base64UrlDecode(publicKey);

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: base64UrlEncodeBytes(publicKeyBytes.slice(1, 33)),
    y: base64UrlEncodeBytes(publicKeyBytes.slice(33, 65)),
    d: base64UrlEncodeBytes(privateKeyBytes),
  };

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    utf8(unsignedToken),
  );

  const signatureB64 = base64UrlEncodeBytes(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    Authorization: `vapid t=${jwt}, k=${publicKey}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`,
  };
}

async function hkdf(
  salt: Uint8Array<ArrayBuffer>,
  ikm: Uint8Array<ArrayBuffer>,
  info: Uint8Array<ArrayBuffer>,
  length: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey(
    'raw',
    salt.length > 0 ? salt : new Uint8Array(32),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', key, ikm));

  const prkKey = await crypto.subtle.importKey(
    'raw',
    prk,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const infoWithCounter = concatBytes(info, new Uint8Array([1]));
  const okm = new Uint8Array(
    await crypto.subtle.sign('HMAC', prkKey, infoWithCounter),
  );

  return okm.slice(0, length);
}

export function base64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (c) => c.codePointAt(0) ?? 0);
}

export function base64UrlEncode(str: string): string {
  return btoa(str)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export function base64UrlEncodeBytes(bytes: Uint8Array<ArrayBuffer>): string {
  const binary = String.fromCodePoint(...bytes);
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function concatBytes(
  ...arrays: Array<Uint8Array<ArrayBuffer>>
): Uint8Array<ArrayBuffer> {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
