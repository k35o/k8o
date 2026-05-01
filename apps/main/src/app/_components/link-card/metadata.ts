import { cacheLife } from 'next/cache';

const decodeHtmlEntities = (text: string): string =>
  text
    .replaceAll(/&amp;/gi, '&')
    .replaceAll(/&lt;/gi, '<')
    .replaceAll(/&gt;/gi, '>')
    .replaceAll(/&quot;/gi, '"')
    .replaceAll(/&#39;/gi, "'")
    .replaceAll(/&nbsp;/gi, ' ')
    .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

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
  const rawTitle = /<title>(.*?)<\/title>/i.exec(html)?.[1];
  const rawOgTitle = /<meta\s+property="og:title"\s+content="(.*?)"/i.exec(
    html,
  )?.[1];
  const rawDescription =
    /<meta\s+property="og:description"\s+content="(.*?)"/i.exec(html)?.[1];
  const rawImage = /<meta\s+property="og:image"\s+content="(.*?)"/i.exec(
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
