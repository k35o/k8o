import {
  base64UrlDecode,
  base64UrlEncode,
  base64UrlEncodeBytes,
} from './base64url';

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
    new TextEncoder().encode(unsignedToken),
  );

  const signatureB64 = base64UrlEncodeBytes(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    Authorization: `vapid t=${jwt}, k=${publicKey}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`,
  };
}
