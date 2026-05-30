// Web Push プロトコルの自前実装（Web Crypto API ベース、依存ゼロ）。
// k8o-push の Cloudflare Worker 実装を移植したもの。Vercel の Node ランタイムでも動作する。
// ECDH 鍵交換 → HKDF 鍵導出 → AES-GCM ペイロード暗号化 → VAPID ES256 JWT 署名。

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

// 送信失敗時に HTTP ステータスを保持するエラー。
// 410 Gone / 404 Not Found の購読削除判定を文字列マッチに頼らず行うために使う。
export class WebPushError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'WebPushError';
    this.status = status;
  }
}

function isCryptoKeyPair(key: CryptoKey | CryptoKeyPair): key is CryptoKeyPair {
  return 'privateKey' in key && 'publicKey' in key;
}

// TextEncoder の出力を ArrayBuffer 由来の Uint8Array に正規化する。
// Web Crypto / fetch の BufferSource は ArrayBuffer 由来であることを要求するため。
function utf8(str: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(str));
}

export async function sendWebPush(
  subscription: Subscription,
  payload: string,
  vapid: VapidOptions,
): Promise<Response> {
  const payloadBytes = utf8(payload);

  // ECDHキーペアを生成
  const keyResult = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );

  if (!isCryptoKeyPair(keyResult)) {
    throw new Error('Expected CryptoKeyPair');
  }
  const localKeyPair = keyResult;

  // クライアントの公開鍵をインポート
  const clientPublicKeyBytes = base64UrlDecode(subscription.keys.p256dh);
  const clientPublicKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  // 共有シークレットを導出
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientPublicKey },
    localKeyPair.privateKey,
    256,
  );

  // ローカル公開鍵をエクスポート
  const localPublicKeyExport = await crypto.subtle.exportKey(
    'raw',
    localKeyPair.publicKey,
  );

  if (!(localPublicKeyExport instanceof ArrayBuffer)) {
    throw new Error('Expected ArrayBuffer');
  }
  const localPublicKeyBytes = localPublicKeyExport;

  // auth secretをデコード
  const authSecret = base64UrlDecode(subscription.keys.auth);

  // 暗号化キーとnonceを導出
  const { contentEncryptionKey, nonce, salt } = await deriveEncryptionKeys(
    sharedSecret,
    authSecret,
    new Uint8Array(localPublicKeyBytes),
    clientPublicKeyBytes,
  );

  // ペイロードを暗号化
  const encrypted = await encryptPayload(
    payloadBytes,
    contentEncryptionKey,
    nonce,
  );

  // 最終的な暗号化ボディを構築
  const body = buildEncryptedBody(new Uint8Array(localPublicKeyBytes), {
    encrypted,
    salt,
  });

  // VAPIDヘッダーを生成
  const vapidHeaders = await generateVapidHeaders(
    subscription.endpoint,
    vapid.vapidSubject,
    vapid.vapidPublicKey,
    vapid.vapidPrivateKey,
  );

  // Push通知を送信
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
  // IKM = HKDF(auth_secret, ecdh_secret, "WebPush: info" || 0x00 || client_public || server_public, 32)
  const info = concatBytes(
    utf8('WebPush: info\0'),
    clientPublicKey,
    localPublicKey,
  );

  const ikm = await hkdf(authSecret, new Uint8Array(sharedSecret), info, 32);

  // PRK for content encryption
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
  // パディング: 1バイトのデリミタ + ペイロード
  const paddedPayload = concatBytes(payload, new Uint8Array([2]));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    paddedPayload,
  );

  return new Uint8Array(encrypted);
}

function buildEncryptedBody(
  localPublicKey: Uint8Array<ArrayBuffer>,
  {
    encrypted,
    salt,
  }: { encrypted: Uint8Array<ArrayBuffer>; salt: Uint8Array<ArrayBuffer> },
): Uint8Array<ArrayBuffer> {
  // aes128gcm header: salt (16) + rs (4) + idlen (1) + keyid (65)
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);

  // P-256公開鍵は65バイト
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
  // exp は 12 時間後（12 * 60 * 60 秒）
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // VAPID秘密鍵をインポート（JWK形式で）
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

  // JWTに署名
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

// HKDF implementation
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

// Utility functions
function base64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (c) => c.codePointAt(0) ?? 0);
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlEncodeBytes(bytes: Uint8Array<ArrayBuffer>): string {
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
