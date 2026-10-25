import { parseHTML } from 'linkedom';

import { isProductionOrigin } from './targets';

export type RawResponse = {
  readonly url: string;
  readonly status: number;
  readonly contentType: string | null;
  readonly location: string | null;
  readonly body: Uint8Array;
};

export type Snapshot = {
  readonly fields: ReadonlyMap<string, string>;
  readonly ogImage: string | null;
  // バイト数は比べる項目にせず、参考として出す
  readonly imageBytes: number | null;
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const readPngSize = (body: Uint8Array): string | null => {
  if (
    body.length < 24 ||
    PNG_SIGNATURE.some((byte, index) => body[index] !== byte)
  ) {
    return null;
  }
  const view = new DataView(body.buffer, body.byteOffset, body.byteLength);
  return `${String(view.getUint32(16))}x${String(view.getUint32(20))}`;
};

const flattenJson = (
  value: unknown,
  path: string,
  fields: Map<string, string>,
): void => {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      flattenJson(item, `${path}[${String(index)}]`, fields);
    }
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      flattenJson(item, `${path}.${key}`, fields);
    }
    return;
  }
  fields.set(path, JSON.stringify(value));
};

const collapseWhitespace = (text: string): string =>
  text.replaceAll(/\s+/gu, ' ').trim();

const imageRatio = (image: Element): string => {
  const width = Number(image.getAttribute('width'));
  const height = Number(image.getAttribute('height'));
  return width > 0 && height > 0 ? (width / height).toFixed(3) : '?';
};

const extractHtml = (
  html: string,
  fields: Map<string, string>,
): string | null => {
  const { document } = parseHTML(html);
  const { head } = document;

  const title = head.querySelector('title');
  if (title !== null) {
    fields.set('title', title.textContent);
  }

  const metas = new Map<string, string[]>();
  for (const meta of head.querySelectorAll('meta')) {
    const key = meta.getAttribute('property') ?? meta.getAttribute('name');
    if (
      key === 'description' ||
      key?.startsWith('og:') === true ||
      key?.startsWith('twitter:') === true
    ) {
      metas.set(key, [
        ...(metas.get(key) ?? []),
        meta.getAttribute('content') ?? '',
      ]);
    }
  }
  for (const [key, contents] of metas) {
    fields.set(`meta:${key}`, contents.join('\n'));
  }

  const canonical = head.querySelector('link[rel="canonical"]');
  if (canonical !== null) {
    fields.set('link:canonical', canonical.getAttribute('href') ?? '');
  }
  const alternates = [...head.querySelectorAll('link[rel="alternate"]')].map(
    (link) =>
      `${link.getAttribute('type') ?? ''} ${link.getAttribute('href') ?? ''}`,
  );
  if (alternates.length > 0) {
    fields.set('link:alternate', alternates.join('\n'));
  }

  for (const [index, script] of [
    ...document.querySelectorAll('script[type="application/ld+json"]'),
  ].entries()) {
    const path = `json-ld[${String(index)}]`;
    try {
      flattenJson(JSON.parse(script.textContent), path, fields);
    } catch {
      fields.set(path, script.textContent);
    }
  }

  const main = document.querySelector('main');
  if (main !== null) {
    fields.set(
      'main:img-ratios',
      [...main.querySelectorAll('img')]
        .map((image) => imageRatio(image))
        .join(' '),
    );
    for (const element of main.querySelectorAll(
      'script, style, template, noscript',
    )) {
      element.remove();
    }
    fields.set('main:text', collapseWhitespace(main.textContent));
  }

  return metas.get('og:image')?.[0] ?? null;
};

const toLocationField = (location: string, url: string): string => {
  const target = new URL(location, url);
  // api は Location を本番の絶対 URL で書くので、preview や手元から取っても本番のオリジンが付く
  return target.origin === new URL(url).origin ||
    isProductionOrigin(target.href)
    ? `${target.pathname}${target.search}${target.hash}`
    : target.href;
};

export const takeSnapshot = (raw: RawResponse): Snapshot => {
  const contentType = raw.contentType ?? '';
  const fields = new Map([
    ['status', String(raw.status)],
    ['content-type', contentType],
  ]);

  if (raw.location !== null) {
    // リダイレクトで約束しているのは status と飛び先で、本文はクライアントが読まないので比べない
    fields.set('location', toLocationField(raw.location, raw.url));
    return { fields, ogImage: null, imageBytes: null };
  }
  if (contentType.startsWith('text/html')) {
    const ogImage = extractHtml(new TextDecoder().decode(raw.body), fields);
    return { fields, ogImage, imageBytes: null };
  }
  if (contentType.startsWith('image/')) {
    fields.set('image:size', readPngSize(raw.body) ?? '不明');
    return { fields, ogImage: null, imageBytes: raw.body.byteLength };
  }
  fields.set('body', new TextDecoder().decode(raw.body));
  return { fields, ogImage: null, imageBytes: null };
};
