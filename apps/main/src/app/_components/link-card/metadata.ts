import { cacheLife } from 'next/cache';

const decodeHtmlEntities = (text: string): string =>
  text
    .replaceAll(/&lt;/giu, '<')
    .replaceAll(/&gt;/giu, '>')
    .replaceAll(/&quot;/giu, '"')
    .replaceAll(/&#39;/giu, "'")
    .replaceAll(/&nbsp;/giu, ' ')
    .replaceAll(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll(/&amp;/giu, '&');

export async function getMetadata(href: string) {
  'use cache';
  cacheLife('days');

  let html: string;
  try {
    const res = await fetch(href, { signal: AbortSignal.timeout(5000) });
    html = (await res.text()).trim();
  } catch {
    return { title: undefined, description: undefined, image: undefined };
  }
  const rawTitle = /<title>(.*?)<\/title>/iu.exec(html)?.[1];
  const rawOgTitle = /<meta\s+property="og:title"\s+content="(.*?)"/iu.exec(
    html,
  )?.[1];
  const rawDescription =
    /<meta\s+property="og:description"\s+content="(.*?)"/iu.exec(html)?.[1];
  const rawImage = /<meta\s+property="og:image"\s+content="(.*?)"/iu.exec(
    html,
  )?.[1];

  const title =
    rawTitle === undefined
      ? rawOgTitle === undefined
        ? undefined
        : decodeHtmlEntities(rawOgTitle)
      : decodeHtmlEntities(rawTitle);
  const description =
    rawDescription === undefined
      ? undefined
      : decodeHtmlEntities(rawDescription);
  const image =
    rawImage === undefined ? undefined : decodeHtmlEntities(rawImage);

  return { title, description, image };
}
