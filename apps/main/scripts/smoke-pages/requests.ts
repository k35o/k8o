import { bypassHeaders } from '../compare-sites/bypass';

export type BlockedCategory = 'api' | 'ga' | 'speed-insights';

export type BlockedRequest = {
  readonly category: BlockedCategory;
  readonly method: string;
  readonly url: string;
  readonly body: string | null;
};

const API_ORIGIN = 'https://api.k8o.me';
const READ_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);
// gtag.js は GA の collect のほかに、Google シグナルの stats.g.doubleclick.net、地域の
// google.<tld> の ga-audiences、tag の診断などへも送る。gtag.js の本体だけを通す
const GOOGLE_MEASUREMENT_HOST =
  /(?:^|\.)(?:google-analytics\.com|google\.[a-z.]+|doubleclick\.net|googlesyndication\.com|googleadservices\.com|googletagmanager\.com)$/u;
const GTAG_SCRIPT = 'https://www.googletagmanager.com/gtag/js';
const SPEED_INSIGHTS_VITALS = '/_vercel/speed-insights/vitals';

export const blockedCategoryOf = (
  method: string,
  url: string,
): BlockedCategory | null => {
  const { origin, hostname, pathname } = new URL(url);
  if (origin === API_ORIGIN && !READ_METHODS.has(method)) {
    return 'api';
  }
  if (
    GOOGLE_MEASUREMENT_HOST.test(hostname) &&
    `${origin}${pathname}` !== GTAG_SCRIPT
  ) {
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
