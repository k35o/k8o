export const BYPASS_ENV = 'K8O_MAIN_PREVIEW_BYPASS';
const BYPASS_HEADER = 'x-vercel-protection-bypass';
// Protection Bypass for Automation が作る値の形。形の崩れた値を、fetch はエラー文に値ごと載せて投げる
const BYPASS_SECRET = /^[A-Za-z0-9]{32}$/u;

export const sendsBypassTo = (url: string): boolean => {
  const { protocol, hostname } = new URL(url);
  return protocol === 'https:' && hostname.endsWith('.vercel.app');
};

export const readBypassSecret = (
  origins: readonly string[],
  value: string | undefined,
): string | null => {
  if (!origins.some((origin) => sendsBypassTo(origin))) {
    return null;
  }
  if (value === undefined || value === '') {
    throw new Error(
      `*.vercel.app と比べるには ${BYPASS_ENV} が要る。fnox exec -P bot -- で渡す`,
    );
  }
  if (!BYPASS_SECRET.test(value)) {
    throw new Error(
      `${BYPASS_ENV} の形が Protection Bypass for Automation の値（英数字 32 字）と合わない。値は出さない`,
    );
  }
  return value;
};

export const bypassHeaders = (
  url: string,
  secret: string | null,
): Record<string, string> =>
  secret !== null && sendsBypassTo(url) ? { [BYPASS_HEADER]: secret } : {};
