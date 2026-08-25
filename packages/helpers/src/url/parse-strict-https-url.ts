// SSRF 対策の共通前段。厳格な https URL としてパースし、小文字化した hostname を
// 返す（不合格は null）。isPublicHttpsUrl と isAllowedPushEndpoint が同じ検証を
// 別々に持って片方だけ強化されるドリフトを防ぐため、ここに一本化する。
const MAX_URL_LENGTH = 2048;

export const parseStrictHttpsHost = (value: string): string | null => {
  if (typeof value !== 'string' || value.length > MAX_URL_LENGTH) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  // userinfo(user:pass@) によるホスト偽装を拒否する
  if (url.username !== '' || url.password !== '') return null;
  if (url.port !== '' && url.port !== '443') return null;

  return url.hostname.toLowerCase();
};
