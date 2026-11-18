import { BOT_USER_AGENT, HTML_ACCEPT } from '../url/html-request-headers.ts';
import { safeFetch } from '../url/safe-fetch.ts';
import { parseOgMetadata } from './og-metadata.ts';
import type { OgMetadata } from './og-metadata.ts';

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
        'user-agent': BOT_USER_AGENT,
        accept: HTML_ACCEPT,
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
