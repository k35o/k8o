import { bypassHeaders } from '../compare-sites/bypass';

export type BlockedCategory = 'api' | 'ga' | 'speed-insights';

const API_ORIGIN = 'https://api.k8o.me';
const READ_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);
const GA_HOST = /(?:^|\.)(?:google-analytics\.com|analytics\.google\.com)$/u;
const SPEED_INSIGHTS_VITALS = '/_vercel/speed-insights/vitals';

export const blockedCategoryOf = (
  method: string,
  url: string,
): BlockedCategory | null => {
  const { origin, hostname, pathname } = new URL(url);
  if (origin === API_ORIGIN && !READ_METHODS.has(method)) {
    return 'api';
  }
  if (GA_HOST.test(hostname)) {
    return 'ga';
  }
  if (pathname.startsWith(SPEED_INSIGHTS_VITALS)) {
    return 'speed-insights';
  }
  return null;
};

export const bypassHeadersFor = (
  url: string,
  origin: string,
  secret: string | null,
): Record<string, string> =>
  new URL(url).origin === origin ? bypassHeaders(url, secret) : {};
