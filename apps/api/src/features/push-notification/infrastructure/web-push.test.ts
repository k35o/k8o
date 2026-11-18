import { Buffer } from 'node:buffer';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  importSubscriptionKeys,
  InvalidSubscriptionKeysError,
  sendWebPush,
  WebPushError,
} from './web-push';

const toB64Url = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString('base64url');

const utf8 = (str: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array(new TextEncoder().encode(str));

const concatBytes = (
  ...arrays: Array<Uint8Array<ArrayBuffer>>
): Uint8Array<ArrayBuffer> => {
  const result = new Uint8Array(
    arrays.reduce((sum, arr) => sum + arr.length, 0),
  );
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

const ensureKeyPair = (key: CryptoKey | CryptoKeyPair): CryptoKeyPair => {
  if ('privateKey' in key && 'publicKey' in key) {
    return key;
  }
  throw new Error('CryptoKeyPair を期待しています');
};

type ClientKeys = {
  keyPair: CryptoKeyPair;
  publicKeyRaw: Uint8Array<ArrayBuffer>;
  authSecret: Uint8Array<ArrayBuffer>;
  subscriptionKeys: { p256dh: string; auth: string };
};

const generateClientKeys = async (): Promise<ClientKeys> => {
  const keyPair = ensureKeyPair(
    await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits'],
    ),
  );
  const publicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', keyPair.publicKey),
  );
  const authSecret = crypto.getRandomValues(new Uint8Array(16));
  return {
    keyPair,
    publicKeyRaw,
    authSecret,
    subscriptionKeys: {
      p256dh: toB64Url(publicKeyRaw),
      auth: toB64Url(authSecret),
    },
  };
};

type VapidKeys = {
  publicKey: string;
  privateKey: string;
};

const generateVapidKeys = async (): Promise<VapidKeys> => {
  const keyPair = ensureKeyPair(
    await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify'],
    ),
  );
  const publicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', keyPair.publicKey),
  );
  const jwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  if (jwk.d === undefined) {
    throw new Error('JWK の d が取得できません');
  }
  return {
    publicKey: toB64Url(publicKeyRaw),
    privateKey: jwk.d,
  };
};

// テスト側は WebCrypto ネイティブの HKDF を使い、実装側(HMAC 手組み)と独立させる
const hkdfDerive = async (
  salt: Uint8Array<ArrayBuffer>,
  ikm: Uint8Array<ArrayBuffer>,
  info: Uint8Array<ArrayBuffer>,
  bits: number,
): Promise<Uint8Array<ArrayBuffer>> => {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
    'deriveBits',
  ]);
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      key,
      bits,
    ),
  );
};

// RFC 8188: 最終レコード末尾に置くパディングデリミタ
const RECORD_PADDING_DELIMITER = 2;

// RFC 8291 の受信側手順で aes128gcm ボディを復号する
const decryptBody = async (
  body: Uint8Array<ArrayBuffer>,
  client: ClientKeys,
): Promise<string> => {
  const salt = body.slice(0, 16);
  const asPublicRaw = body.slice(21, 86);
  const ciphertext = body.slice(86);

  const asPublicKey = await crypto.subtle.importKey(
    'raw',
    asPublicRaw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: asPublicKey },
      client.keyPair.privateKey,
      256,
    ),
  );

  const info = concatBytes(
    utf8('WebPush: info\0'),
    client.publicKeyRaw,
    asPublicRaw,
  );
  const ikm = await hkdfDerive(client.authSecret, sharedSecret, info, 256);
  const cek = await hkdfDerive(
    salt,
    ikm,
    utf8('Content-Encoding: aes128gcm\0'),
    128,
  );
  const nonce = await hkdfDerive(
    salt,
    ikm,
    utf8('Content-Encoding: nonce\0'),
    96,
  );

  const key = await crypto.subtle.importKey(
    'raw',
    cek,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );
  const padded = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      key,
      ciphertext,
    ),
  );

  const delimiter = padded.at(-1);
  if (delimiter !== RECORD_PADDING_DELIMITER) {
    throw new Error(
      `復号結果の末尾が RFC 8188 のパディングデリミタ(${RECORD_PADDING_DELIMITER})ではありません: ${String(delimiter)}`,
    );
  }
  return new TextDecoder().decode(padded.slice(0, -1));
};

const mockFetch = vi.fn() as ReturnType<typeof vi.fn>;

type CapturedRequest = {
  url: string;
  headers: Record<string, string>;
  body: Uint8Array<ArrayBuffer>;
  init: RequestInit;
};

const capturedRequest = (): CapturedRequest => {
  const call = mockFetch.mock.calls.at(0) as
    | [string, RequestInit & { body: Uint8Array<ArrayBuffer> }]
    | undefined;
  if (call === undefined) {
    throw new Error('fetch が呼ばれていません');
  }
  return {
    url: call[0],
    headers: call[1].headers as Record<string, string>,
    body: call[1].body,
    init: call[1],
  };
};

describe('importSubscriptionKeys', () => {
  describe('正常系', () => {
    it('ブラウザが作る形の鍵を読み込める', async () => {
      const client = await generateClientKeys();

      await expect(
        importSubscriptionKeys(client.subscriptionKeys),
      ).resolves.not.toBeNull();
    });

    it('auth は32バイトまで受け付ける', async () => {
      const client = await generateClientKeys();

      await expect(
        importSubscriptionKeys({
          p256dh: client.subscriptionKeys.p256dh,
          auth: toB64Url(new Uint8Array(32)),
        }),
      ).resolves.not.toBeNull();
    });
  });

  describe('異常系', () => {
    it.each([
      [
        'P-256 の曲線上に無い点',
        (keys: ClientKeys): { p256dh: string; auth: string } => ({
          p256dh: toB64Url(
            concatBytes(Uint8Array.from([4]), new Uint8Array(64)),
          ),
          auth: keys.subscriptionKeys.auth,
        }),
      ],
      [
        // y の偶奇によらず、x 座標に 0x02 を付ければ曲線上の点になる
        '圧縮形式の点',
        (keys: ClientKeys): { p256dh: string; auth: string } => ({
          p256dh: toB64Url(
            concatBytes(Uint8Array.from([2]), keys.publicKeyRaw.slice(1, 33)),
          ),
          auth: keys.subscriptionKeys.auth,
        }),
      ],
      [
        '先頭が 0x04 でない65バイト',
        (keys: ClientKeys): { p256dh: string; auth: string } => ({
          p256dh: toB64Url(
            concatBytes(Uint8Array.from([5]), keys.publicKeyRaw.slice(1)),
          ),
          auth: keys.subscriptionKeys.auth,
        }),
      ],
      [
        'base64url で使わない文字を含む p256dh',
        (keys: ClientKeys): { p256dh: string; auth: string } => ({
          p256dh: `${keys.subscriptionKeys.p256dh}!`,
          auth: keys.subscriptionKeys.auth,
        }),
      ],
      [
        '16バイト未満の auth',
        (keys: ClientKeys): { p256dh: string; auth: string } => ({
          p256dh: keys.subscriptionKeys.p256dh,
          auth: toB64Url(new Uint8Array(15)),
        }),
      ],
      [
        '32バイトを超える auth',
        (keys: ClientKeys): { p256dh: string; auth: string } => ({
          p256dh: keys.subscriptionKeys.p256dh,
          auth: toB64Url(new Uint8Array(33)),
        }),
      ],
    ])('%sは読み込めない', async (_, toKeys) => {
      const client = await generateClientKeys();

      await expect(importSubscriptionKeys(toKeys(client))).resolves.toBeNull();
    });

    it('鍵の中身と関係のない importKey の失敗は、読めない鍵とせずにそのまま投げる', async () => {
      const client = await generateClientKeys();
      const importKey = vi
        .spyOn(crypto.subtle, 'importKey')
        .mockRejectedValueOnce(
          new DOMException('not supported', 'NotSupportedError'),
        );

      await expect(
        importSubscriptionKeys(client.subscriptionKeys),
      ).rejects.toThrow('not supported');
      importKey.mockRestore();
    });
  });
});

describe('sendWebPush', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      text: () => Promise.resolve(''),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('正常系', () => {
    it('送信ボディを RFC 8291 の受信手順で復号すると元の payload に一致する', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();
      const payload = JSON.stringify({
        title: '新着記事',
        body: 'テスト通知です',
      });

      await sendWebPush(
        {
          endpoint: 'https://push.example.net/push/abc',
          keys: client.subscriptionKeys,
        },
        payload,
        {
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
          subject: 'mailto:admin@example.com',
        },
      );

      const { body } = capturedRequest();
      await expect(decryptBody(body, client)).resolves.toBe(payload);
    });

    it('aes128gcm のヘッダを付けて endpoint に POST する', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();

      await sendWebPush(
        {
          endpoint: 'https://push.example.net/push/abc',
          keys: client.subscriptionKeys,
        },
        'hello',
        {
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
          subject: 'mailto:admin@example.com',
        },
      );

      const { url, headers, body, init } = capturedRequest();
      expect(url).toBe('https://push.example.net/push/abc');
      expect(init.method).toBe('POST');
      expect(init.redirect).toBe('manual');
      expect(headers['Content-Type']).toBe('application/octet-stream');
      expect(headers['Content-Encoding']).toBe('aes128gcm');
      expect(headers['TTL']).toBe('86400');
      // RFC 8188 ヘッダ: rs=4096(BE) と idlen=65
      expect(body.slice(16, 20)).toStrictEqual(Uint8Array.from([0, 0, 16, 0]));
      expect(body[20]).toBe(65);
    });

    it('応答しない Push サービスを待ち続けないよう、10秒で打ち切る signal を付ける', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();
      const timeout = vi.spyOn(AbortSignal, 'timeout');

      await sendWebPush(
        {
          endpoint: 'https://push.example.net/push/abc',
          keys: client.subscriptionKeys,
        },
        'hello',
        {
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
          subject: 'mailto:admin@example.com',
        },
      );

      const { init } = capturedRequest();
      expect(timeout).toHaveBeenCalledExactlyOnceWith(10_000);
      expect(init.signal).toBe(timeout.mock.results[0]?.value);
      timeout.mockRestore();
    });

    it('VAPID の Authorization と Crypto-Key のヘッダを付ける', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();

      await sendWebPush(
        {
          endpoint: 'https://fcm.googleapis.com/fcm/send/xyz',
          keys: client.subscriptionKeys,
        },
        'hello',
        {
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
          subject: 'mailto:admin@example.com',
        },
      );

      const { headers } = capturedRequest();
      expect(headers['Crypto-Key']).toBe(`p256ecdsa=${vapid.publicKey}`);
      expect(headers['Authorization']).toMatch(
        new RegExp(`^vapid t=[^,]+, k=${vapid.publicKey}$`, 'u'),
      );
    });
  });

  describe('異常系', () => {
    it('push サービスがエラー応答を返したら status 付きの WebPushError を投げる', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();
      mockFetch.mockResolvedValue({
        ok: false,
        status: 410,
        text: () => Promise.resolve('Gone'),
      });

      const promise = sendWebPush(
        {
          endpoint: 'https://push.example.net/push/abc',
          keys: client.subscriptionKeys,
        },
        'hello',
        {
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
          subject: 'mailto:admin@example.com',
        },
      );

      await expect(promise).rejects.toThrow(WebPushError);
      await expect(promise).rejects.toMatchObject({ status: 410 });
    });

    it('購読の鍵を読み込めなければ、送らずに InvalidSubscriptionKeysError を投げる', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();

      const promise = sendWebPush(
        {
          endpoint: 'https://push.example.net/push/abc',
          keys: {
            p256dh: toB64Url(
              concatBytes(Uint8Array.from([4]), new Uint8Array(64)),
            ),
            auth: client.subscriptionKeys.auth,
          },
        },
        'hello',
        {
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
          subject: 'mailto:admin@example.com',
        },
      );

      await expect(promise).rejects.toThrow(InvalidSubscriptionKeysError);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('VAPID の鍵を読み込めない失敗は、購読の鍵の誤りとして扱わない', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();

      const promise = sendWebPush(
        {
          endpoint: 'https://push.example.net/push/abc',
          keys: client.subscriptionKeys,
        },
        'hello',
        {
          publicKey: vapid.publicKey,
          privateKey: toB64Url(new Uint8Array(5)),
          subject: 'mailto:admin@example.com',
        },
      );

      await expect(promise).rejects.not.toBeInstanceOf(
        InvalidSubscriptionKeysError,
      );
    });
  });
});
