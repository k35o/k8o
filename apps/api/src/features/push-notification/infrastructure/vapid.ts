const fromBase64Url = (str: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.fromBase64(str, { alphabet: 'base64url' });

const toBase64Url = (bytes: Uint8Array): string =>
  bytes.toBase64({ alphabet: 'base64url', omitPadding: true });

const jsonToBase64Url = (value: unknown): string =>
  toBase64Url(new TextEncoder().encode(JSON.stringify(value)));

export type VapidConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

const TOKEN_LIFETIME_SECONDS = 12 * 60 * 60;

export async function generateVapidHeaders(
  endpoint: string,
  { publicKey, privateKey, subject }: VapidConfig,
): Promise<{ Authorization: string; 'Crypto-Key': string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    sub: subject,
  };

  const headerB64 = jsonToBase64Url(header);
  const payloadB64 = jsonToBase64Url(payload);
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const privateKeyBytes = fromBase64Url(privateKey);
  const publicKeyBytes = fromBase64Url(publicKey);

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: toBase64Url(publicKeyBytes.slice(1, 33)),
    y: toBase64Url(publicKeyBytes.slice(33, 65)),
    d: toBase64Url(privateKeyBytes),
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
    new TextEncoder().encode(unsignedToken),
  );

  const signatureB64 = toBase64Url(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    Authorization: `vapid t=${jwt}, k=${publicKey}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`,
  };
}
