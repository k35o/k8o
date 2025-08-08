import { unstable_cache as cache } from 'next/cache';

export const getMetadata = cache(async (href: string) => {
  const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(href)}`;
  const res = await fetch(proxyUrl);
  const html = (await res.text()).trim();
  const title = /<title>(.*?)<\/title>/i.exec(html)?.[1];
  const ogTitle = /<meta\s+property="og:title"\s+content="(.*?)"/i.exec(
    html,
  )?.[1];
  const description =
    /<meta\s+property="og:description"\s+content="(.*?)"/i.exec(html)?.[1];
  const image = /<meta\s+property="og:image"\s+content="(.*?)"/i.exec(
    html,
  )?.[1];
  return { title: title ?? ogTitle, description, image };
});
