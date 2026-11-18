export type RecipientKeys = {
  publicKey: CryptoKey;
  publicKeyBytes: Uint8Array<ArrayBuffer>;
  authSecret: Uint8Array<ArrayBuffer>;
};

function isCryptoKeyPair(key: CryptoKey | CryptoKeyPair): key is CryptoKeyPair {
  return 'privateKey' in key && 'publicKey' in key;
}

function utf8(str: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new TextEncoder().encode(str));
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

async function hkdf(
  salt: Uint8Array<ArrayBuffer>,
  ikm: Uint8Array<ArrayBuffer>,
  info: Uint8Array<ArrayBuffer>,
  length: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
    'deriveBits',
  ]);
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      key,
      length * 8,
    ),
  );
}

async function deriveEncryptionKeys(
  sharedSecret: ArrayBuffer,
  authSecret: Uint8Array<ArrayBuffer>,
  localPublicKey: Uint8Array<ArrayBuffer>,
  recipientPublicKey: Uint8Array<ArrayBuffer>,
): Promise<{
  contentEncryptionKey: CryptoKey;
  nonce: Uint8Array<ArrayBuffer>;
  salt: Uint8Array<ArrayBuffer>;
}> {
  const info = concatBytes(
    utf8('WebPush: info\0'),
    recipientPublicKey,
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

async function encryptRecord(
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

/** RFC 8291 に沿って payload を暗号化し、aes128gcm のボディを返す。 */
export async function encryptPushPayload(
  payload: string,
  recipient: RecipientKeys,
): Promise<Uint8Array<ArrayBuffer>> {
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
    { name: 'ECDH', public: recipient.publicKey },
    localKeyPair.privateKey,
    256,
  );

  const localPublicKeyExport = await crypto.subtle.exportKey(
    'raw',
    localKeyPair.publicKey,
  );
  if (!(localPublicKeyExport instanceof ArrayBuffer)) {
    throw new TypeError('Expected ArrayBuffer');
  }
  const localPublicKey = new Uint8Array(localPublicKeyExport);

  const { contentEncryptionKey, nonce, salt } = await deriveEncryptionKeys(
    sharedSecret,
    recipient.authSecret,
    localPublicKey,
    recipient.publicKeyBytes,
  );

  const encrypted = await encryptRecord(
    payloadBytes,
    contentEncryptionKey,
    nonce,
  );
  return buildEncryptedBody(localPublicKey, { encrypted, salt });
}
