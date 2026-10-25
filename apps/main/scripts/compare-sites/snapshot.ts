import { parseHTML } from 'linkedom';

import { isProductionOrigin } from './targets';

export type RawResponse = {
  readonly url: string;
  readonly status: number;
  readonly headers: Headers;
  readonly body: Uint8Array;
};

export type Snapshot = {
  readonly fields: ReadonlyMap<string, string>;
  readonly ogImage: string | null;
  // バイト数は比べる項目にせず、参考として出す
  readonly imageBytes: number | null;
};

const COMPARED_HEADERS = [
  'content-security-policy',
  'content-security-policy-report-only',
  'reporting-endpoints',
  'x-content-type-options',
  'permissions-policy',
  'vary',
  'cache-control',
  'access-control-allow-origin',
];

// Next を名乗る meta と Next の内部の meta で、外との約束ではない
const IGNORED_META_NAMES = new Set(['generator', 'next-size-adjust']);

const COMPARED_LINK_RELS = new Set([
  'canonical',
  'alternate',
  'manifest',
  'icon',
  'apple-touch-icon',
]);

// Next はメタデータのファイルの URL に中身のハッシュを query で付け、ファイルを public に置くと付かない
const ICON_RELS = new Set(['icon', 'apple-touch-icon']);

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

// React は charSet などを大文字を含む名前のまま書き、linkedom の getAttribute は名前の大文字と小文字を区別する
const attributesOf = (element: Element): Map<string, string> =>
  new Map(
    [...element.attributes].map(({ name, value }) => [
      name.toLowerCase(),
      value,
    ]),
  );

const metaEntry = (meta: Element): readonly [string, string] | null => {
  const attributes = attributesOf(meta);
  const charset = attributes.get('charset');
  if (charset !== undefined) {
    return ['charset', charset];
  }
  const content = attributes.get('content') ?? '';
  const httpEquiv = attributes.get('http-equiv');
  if (httpEquiv !== undefined) {
    return [`http-equiv:${httpEquiv.toLowerCase()}`, content];
  }
  const key = attributes.get('property') ?? attributes.get('name');
  return key === undefined || IGNORED_META_NAMES.has(key)
    ? null
    : [key, content];
};

const describeLink = (link: Element, rel: string): string => {
  const { href = '', ...rest } = Object.fromEntries(attributesOf(link));
  const attributes = Object.entries(rest)
    .filter(([name]) => name !== 'rel')
    .map(([name, value]) => `${name}=${value}`)
    .toSorted();
  return [
    ICON_RELS.has(rel) ? href.replace(/\?.*$/u, '') : href,
    ...attributes,
  ].join(' ');
};

const appendTo = (
  groups: Map<string, string[]>,
  key: string,
  value: string,
): void => {
  groups.set(key, [...(groups.get(key) ?? []), value]);
};

const extractHtml = (
  html: string,
  fields: Map<string, string>,
): string | null => {
  const { document } = parseHTML(html);
  const { head } = document;

  const lang = document.documentElement.getAttribute('lang');
  if (lang !== null) {
    fields.set('html:lang', lang);
  }

  const title = head.querySelector('title');
  if (title !== null) {
    fields.set('title', title.textContent);
  }

  const metas = new Map<string, string[]>();
  for (const meta of head.querySelectorAll('meta')) {
    const entry = metaEntry(meta);
    if (entry !== null) {
      appendTo(metas, entry[0], entry[1]);
    }
  }
  for (const [key, contents] of metas) {
    fields.set(`meta:${key}`, contents.join('\n'));
  }

  const links = new Map<string, string[]>();
  for (const link of head.querySelectorAll('link')) {
    for (const rel of (link.getAttribute('rel') ?? '').split(/\s+/u)) {
      if (COMPARED_LINK_RELS.has(rel)) {
        appendTo(links, rel, describeLink(link, rel));
      }
    }
  }
  for (const [rel, descriptions] of links) {
    fields.set(`link:${rel}`, descriptions.join('\n'));
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

export const takeSnapshot = (
  raw: RawResponse,
  extraHeaders: readonly string[] = [],
): Snapshot => {
  const contentType = raw.headers.get('content-type') ?? '';
  const fields = new Map([
    ['status', String(raw.status)],
    ['content-type', contentType],
  ]);
  for (const name of [...COMPARED_HEADERS, ...extraHeaders]) {
    const value = raw.headers.get(name);
    if (value !== null) {
      fields.set(`header:${name}`, value);
    }
  }

  const location = raw.headers.get('location');
  if (location !== null) {
    // リダイレクトで約束しているのは status と飛び先で、本文はクライアントが読まないので比べない
    fields.set('location', toLocationField(location, raw.url));
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
