import { Buffer } from 'node:buffer';

import { describe, expect, it } from 'vitest';

import { generateVapidHeaders } from './vapid';

const fromB64Url = (value: string): Uint8Array<ArrayBuffer> =>
  new Uint8Array(Buffer.from(value, 'base64url'));

const toB64Url = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString('base64url');

const ensureKeyPair = (key: CryptoKey | CryptoKeyPair): CryptoKeyPair => {
  if ('privateKey' in key && 'publicKey' in key) {
    return key;
  }
  throw new Error('CryptoKeyPair を期待しています');
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

describe('generateVapidHeaders', () => {
  describe('正常系', () => {
    it('JWT が公開鍵で検証でき aud/exp/sub が正しい', async () => {
      const vapid = await generateVapidKeys();

      const headers = await generateVapidHeaders(
        'https://fcm.googleapis.com/fcm/send/xyz',
        {
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
          subject: 'mailto:admin@example.com',
        },
      );

      expect(headers['Crypto-Key']).toBe(`p256ecdsa=${vapid.publicKey}`);

      const { key, headerB64, payloadB64, signatureB64 } =
        parseVapidAuthorization(headers.Authorization);
      expect(key).toBe(vapid.publicKey);

      const header: unknown = JSON.parse(
        new TextDecoder().decode(fromB64Url(headerB64)),
      );
      expect(header).toStrictEqual({ typ: 'JWT', alg: 'ES256' });

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
        new TextEncoder().encode(`${headerB64}.${payloadB64}`),
      );
      expect(valid).toBe(true);
    });
  });

  describe('異常系', () => {
    it('秘密鍵を読み込めなければ失敗する', async () => {
      const vapid = await generateVapidKeys();

      await expect(
        generateVapidHeaders('https://fcm.googleapis.com/fcm/send/xyz', {
          publicKey: vapid.publicKey,
          privateKey: toB64Url(new Uint8Array(5)),
          subject: 'mailto:admin@example.com',
        }),
      ).rejects.toMatchObject({ name: 'DataError' });
    });
  });
});
