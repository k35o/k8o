import { Buffer } from 'node:buffer';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildEncryptedBody, encryptPushPayload } from './payload-encryption';

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

describe('buildEncryptedBody', () => {
  describe('正常系', () => {
    it('salt / rs / idlen / 公開鍵 / 暗号文の順に連結する', () => {
      const salt = Uint8Array.from({ length: 16 }, (_, i) => i);
      const publicKey = new Uint8Array(65).fill(0xaa);
      const encrypted = Uint8Array.from([9, 8, 7]);

      const body = buildEncryptedBody(publicKey, { encrypted, salt });

      expect(body).toHaveLength(16 + 4 + 1 + 65 + 3);
      expect(body.slice(0, 16)).toStrictEqual(salt);
      // rs は 4096 のビッグエンディアン
      expect(body.slice(16, 20)).toStrictEqual(Uint8Array.from([0, 0, 16, 0]));
      // idlen は P-256 公開鍵長の 65
      expect(body[20]).toBe(65);
      expect(body.slice(21, 86)).toStrictEqual(publicKey);
      expect(body.slice(86)).toStrictEqual(encrypted);
    });
  });
});

describe('encryptPushPayload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('正常系', () => {
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
      const uaPublicRaw = fromB64Url(RFC8291_UA_PUBLIC);
      const uaPublicKey = await realSubtle.importKey(
        'raw',
        uaPublicRaw,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
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

      const body = await encryptPushPayload(RFC8291_PLAINTEXT, {
        publicKey: uaPublicKey,
        publicKeyBytes: uaPublicRaw,
        authSecret: fromB64Url(RFC8291_AUTH_SECRET),
      });

      expect(toB64Url(body)).toBe(RFC8291_ENCRYPTED_MESSAGE);
    });
  });
});
