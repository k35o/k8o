import { type OgMetadata, parseOgMetadata } from '@repo/helpers/og/og-metadata';
import { safeFetch } from '@repo/helpers/url/safe-fetch';

const TIMEOUT_MS = 5000;

const EMPTY_METADATA: OgMetadata = {
  title: undefined,
  description: undefined,
  imageUrl: undefined,
};

// UA を付与しないと弾くサイトがあるため明示する。
export const fetchOgMetadata = async (url: string): Promise<OgMetadata> => {
  let response: Response;
  try {
    // SSRF 対策: 公開 https URL のみ許可し、リダイレクト先も都度検証する
    response = await safeFetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; k8o-bot/1.0; +https://k8o.me)',
        accept: 'text/html,application/xhtml+xml',
      },
    });
  } catch {
    return EMPTY_METADATA;
  }

  if (!response.ok) {
    return EMPTY_METADATA;
  }

  let html: string;
  try {
    html = (await response.text()).trim();
  } catch {
    return EMPTY_METADATA;
  }

  return parseOgMetadata(html, response.url === '' ? url : response.url);
};
