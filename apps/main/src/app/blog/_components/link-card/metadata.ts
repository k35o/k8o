import { fetchOgMetadata } from '@repo/helpers/og/fetch-og-metadata';
import type { OgMetadata } from '@repo/helpers/og/og-metadata';
import { cacheLife } from 'next/cache';

export async function getMetadata(href: string): Promise<OgMetadata> {
  'use cache';
  cacheLife('days');

  const metadata = await fetchOgMetadata(href);
  return metadata;
}
