import { cacheLife } from 'next/cache';

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

export async function getMetadata(href: string) {
  'use cache';
  cacheLife('days');

  const res = await fetch(href);
  const html = (await res.text()).trim();
  const rawTitle = /<title>(.*?)<\/title>/i.exec(html)?.[1];
  const rawOgTitle = /<meta\s+property="og:title"\s+content="(.*?)"/i.exec(
    html,
  )?.[1];
  const rawDescription =
    /<meta\s+property="og:description"\s+content="(.*?)"/i.exec(html)?.[1];
  const image = /<meta\s+property="og:image"\s+content="(.*?)"/i.exec(
    html,
  )?.[1];

  const title = rawTitle
    ? decodeHtmlEntities(rawTitle)
    : rawOgTitle
      ? decodeHtmlEntities(rawOgTitle)
      : undefined;
  const description = rawDescription
    ? decodeHtmlEntities(rawDescription)
    : undefined;

  return { title, description, image };
}
