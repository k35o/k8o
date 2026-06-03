import { type OgMetadata, parseOgMetadata } from '@repo/helpers/og/og-metadata';
import { cacheLife } from 'next/cache';

const EMPTY_METADATA: OgMetadata = {
  title: undefined,
  description: undefined,
  image: undefined,
};

export async function getMetadata(href: string): Promise<OgMetadata> {
  'use cache';
  cacheLife('days');

  let response: Response;
  try {
    response = await fetch(href, {
      signal: AbortSignal.timeout(5000),
      // 一部サイトは User-Agent の無いリクエストを弾くため UA を明示する
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

  return parseOgMetadata(html, response.url === '' ? href : response.url);
}
