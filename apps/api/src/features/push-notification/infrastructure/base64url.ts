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
