import { safeFetch } from '../url/safe-fetch';
import { parseOgMetadata } from './og-metadata';
import type { OgMetadata } from './og-metadata';

const TIMEOUT_MS = 5000;

const EMPTY_METADATA: OgMetadata = {
  title: undefined,
  description: undefined,
  imageUrl: undefined,
};

// 外部ページの OGP メタデータを取得する。SSRF 対策のため safeFetch を使い、
// 一部サイトが UA 無しを弾くため User-Agent を明示する。
// 取得・解析に失敗したときは空メタデータを返して呼び出し側を止めない。
export const fetchOgMetadata = async (url: string): Promise<OgMetadata> => {
  let response: Response;
  try {
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
