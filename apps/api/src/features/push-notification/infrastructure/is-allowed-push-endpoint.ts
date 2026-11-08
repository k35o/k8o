import { parseStrictHttpsHost } from '@repo/helpers/url/parse-strict-https-url';

// SSRF 防止のため https + Push サービスホスト allowlist に限定する。
const ALLOWED_HOSTS: ReadonlySet<string> = new Set([
  'fcm.googleapis.com',
  'updates.push.services.mozilla.com',
]);

// サブドメイン境界を守るため先頭ドット必須
const ALLOWED_HOST_SUFFIXES: readonly string[] = [
  '.push.apple.com',
  '.notify.windows.com',
];

export const isAllowedPushEndpoint = (endpoint: string): boolean => {
  const host = parseStrictHttpsHost(endpoint);
  if (host === null) {
    return false;
  }

  if (ALLOWED_HOSTS.has(host)) {
    return true;
  }

  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
};
