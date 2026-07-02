import { Buffer } from 'node:buffer';

import {
  base64UrlDecode,
  base64UrlEncode,
  base64UrlEncodeBytes,
  buildEncryptedBody,
  sendWebPush,
  WebPushError,
} from './web-push';

// RFC 8291 Appendix A / Section 5 のテストベクタ
const RFC8291_AS_PUBLIC =
  'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
const RFC8291_AS_PRIVATE = 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw';
const RFC8291_UA_PUBLIC =
  'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4';
const RFC8291_SALT = 'DGv6ra1nlYgDCS1FRnbzlw';
const RFC8291_AUTH_SECRET = 'BTBZMqHH6r4Tts7J_aSIgg';
const RFC8291_PLAINTEXT = 'When I grow up, I want to be a watermelon';
const RFC8291_ENCRYPTED_MESSAGE =
  'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN';

const fromB64Url = (value: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array(Buffer.from(value, 'base64url'));

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
  verifyKey: CryptoKey;
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
    verifyKey: keyPair.publicKey,
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

  expect(padded.at(-1)).toBe(2);
  return new TextDecoder().decode(padded.slice(0, -1));
};

type VapidAuthorization = {
  key: string;
  headerB64: string;
  payloadB64: string;
  signatureB64: string;
};

const parseVapidAuthorization = (
  header: string | undefined,
): VapidAuthorization => {
  const match = /^vapid t=(?<token>[^,]+), k=(?<key>.+)$/u.exec(header ?? '');
  const key = match?.groups?.['key'];
  const [headerB64, payloadB64, signatureB64] = (
    match?.groups?.['token'] ?? ''
  ).split('.');
  if (
    key === undefined ||
    headerB64 === undefined ||
    payloadB64 === undefined ||
    signatureB64 === undefined
  ) {
    throw new Error('Authorization ヘッダが VAPID 形式ではありません');
  }
  return { key, headerB64, payloadB64, signatureB64 };
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

describe('base64UrlDecode', () => {
  describe('正常系', () => {
    it('base64url 文字列をバイト列に復号する', () => {
      expect(base64UrlDecode('AQID')).toEqual(Uint8Array.from([1, 2, 3]));
    });

    it('URL セーフ文字(-/_)を + と / として扱う', () => {
      expect(base64UrlDecode('-_8')).toEqual(Uint8Array.from([251, 255]));
    });

    it('パディング無しの文字列を復号する', () => {
      expect(base64UrlDecode('YQ')).toEqual(Uint8Array.from([97]));
    });
  });

  describe('エッジケース', () => {
    it('空文字列は空のバイト列になる', () => {
      expect(base64UrlDecode('')).toEqual(new Uint8Array(0));
    });

    it('encode したバイト列を decode すると元に戻る', () => {
      const bytes = Uint8Array.from([0, 1, 62, 63, 127, 128, 254, 255]);
      expect(base64UrlDecode(base64UrlEncodeBytes(bytes))).toEqual(bytes);
    });
  });
});

describe('base64UrlEncode / base64UrlEncodeBytes', () => {
  describe('正常系', () => {
    it('文字列を URL セーフな base64 に符号化する', () => {
      expect(base64UrlEncode('>>>')).toBe('Pj4-');
    });

    it('パディングの = を出力しない', () => {
      expect(base64UrlEncode('a')).toBe('YQ');
    });

    it('バイト列の符号化結果が Node の base64url と一致する', () => {
      const bytes = Uint8Array.from([251, 255, 0, 62]);
      expect(base64UrlEncodeBytes(bytes)).toBe(toB64Url(bytes));
    });
  });
});

describe('buildEncryptedBody', () => {
  describe('正常系', () => {
    it('salt / rs / idlen / 公開鍵 / 暗号文の順に連結する', () => {
      const salt = Uint8Array.from({ length: 16 }, (_, i) => i);
      const publicKey = new Uint8Array(65).fill(0xaa);
      const encrypted = Uint8Array.from([9, 8, 7]);

      const body = buildEncryptedBody(publicKey, { encrypted, salt });

      expect(body).toHaveLength(16 + 4 + 1 + 65 + 3);
      expect(body.slice(0, 16)).toEqual(salt);
      // rs は 4096 のビッグエンディアン
      expect(body.slice(16, 20)).toEqual(Uint8Array.from([0, 0, 16, 0]));
      // idlen は P-256 公開鍵長の 65
      expect(body[20]).toBe(65);
      expect(body.slice(21, 86)).toEqual(publicKey);
      expect(body.slice(86)).toEqual(encrypted);
    });
  });
});

describe('sendWebPush', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
          vapidPublicKey: vapid.publicKey,
          vapidPrivateKey: vapid.privateKey,
          vapidSubject: 'mailto:admin@example.com',
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
          vapidPublicKey: vapid.publicKey,
          vapidPrivateKey: vapid.privateKey,
          vapidSubject: 'mailto:admin@example.com',
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
      expect(body.slice(16, 20)).toEqual(Uint8Array.from([0, 0, 16, 0]));
      expect(body[20]).toBe(65);
    });

    it('VAPID の JWT が公開鍵で検証でき aud/exp/sub が正しい', async () => {
      const client = await generateClientKeys();
      const vapid = await generateVapidKeys();

      await sendWebPush(
        {
          endpoint: 'https://fcm.googleapis.com/fcm/send/xyz',
          keys: client.subscriptionKeys,
        },
        'hello',
        {
          vapidPublicKey: vapid.publicKey,
          vapidPrivateKey: vapid.privateKey,
          vapidSubject: 'mailto:admin@example.com',
        },
      );

      const { headers } = capturedRequest();
      expect(headers['Crypto-Key']).toBe(`p256ecdsa=${vapid.publicKey}`);

      const { key, headerB64, payloadB64, signatureB64 } =
        parseVapidAuthorization(headers['Authorization']);
      expect(key).toBe(vapid.publicKey);

      const header: unknown = JSON.parse(
        new TextDecoder().decode(fromB64Url(headerB64)),
      );
      expect(header).toEqual({ typ: 'JWT', alg: 'ES256' });

      const claims = JSON.parse(
        new TextDecoder().decode(fromB64Url(payloadB64)),
      ) as { aud: string; exp: number; sub: string };
      expect(claims.aud).toBe('https://fcm.googleapis.com');
      expect(claims.sub).toBe('mailto:admin@example.com');
      const nowSec = Math.floor(Date.now() / 1000);
      expect(claims.exp).toBeGreaterThan(nowSec);
      expect(claims.exp).toBeLessThanOrEqual(nowSec + 12 * 60 * 60);

      const valid = await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        vapid.verifyKey,
        fromB64Url(signatureB64),
        utf8(`${headerB64}.${payloadB64}`),
      );
      expect(valid).toBe(true);
    });

    it('RFC 8291 Appendix A のテストベクタと同じ暗号文を生成する', async () => {
      const realSubtle = crypto.subtle;
      const asPublicRaw = fromB64Url(RFC8291_AS_PUBLIC);
      const asJwk = {
        kty: 'EC',
        crv: 'P-256',
        x: toB64Url(asPublicRaw.slice(1, 33)),
        y: toB64Url(asPublicRaw.slice(33, 65)),
      };
      const asPrivateKey = await realSubtle.importKey(
        'jwk',
        { ...asJwk, d: RFC8291_AS_PRIVATE },
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveBits'],
      );
      const asPublicKey = await realSubtle.importKey(
        'jwk',
        asJwk,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        [],
      );

      // 鍵ペアと salt を RFC のテストベクタに固定する
      vi.stubGlobal('crypto', {
        getRandomValues: <T extends ArrayBufferView>(array: T): T => {
          new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(
            fromB64Url(RFC8291_SALT),
          );
          return array;
        },
        subtle: {
          generateKey: () =>
            Promise.resolve({
              privateKey: asPrivateKey,
              publicKey: asPublicKey,
            }),
          importKey: realSubtle.importKey.bind(realSubtle),
          deriveBits: realSubtle.deriveBits.bind(realSubtle),
          exportKey: realSubtle.exportKey.bind(realSubtle),
          encrypt: realSubtle.encrypt.bind(realSubtle),
          sign: realSubtle.sign.bind(realSubtle),
        },
      });

      await sendWebPush(
        {
          endpoint:
            'https://push.example.net/push/JzLQ3raZJfFBR0aqvOMsLrt54w4rJUsV',
          keys: { p256dh: RFC8291_UA_PUBLIC, auth: RFC8291_AUTH_SECRET },
        },
        RFC8291_PLAINTEXT,
        {
          vapidPublicKey: RFC8291_AS_PUBLIC,
          vapidPrivateKey: RFC8291_AS_PRIVATE,
          vapidSubject: 'mailto:admin@example.com',
        },
      );

      const { body } = capturedRequest();
      expect(toB64Url(body)).toBe(RFC8291_ENCRYPTED_MESSAGE);
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
          vapidPublicKey: vapid.publicKey,
          vapidPrivateKey: vapid.privateKey,
          vapidSubject: 'mailto:admin@example.com',
        },
      );

      await expect(promise).rejects.toThrow(WebPushError);
      await expect(promise).rejects.toMatchObject({ status: 410 });
    });
  });
});
