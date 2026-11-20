const APPLE_DOCUMENTATION_HOST = 'developer.apple.com';
const APPLE_DOCUMENTATION_PATH = /^\/documentation\/[\w/-]+$/u;

// developer.apple.com のドキュメントは JavaScript で描くページで、HTML に本文が無い。同じ中身を
// 配っている JSON の URL。ドキュメントのページでなければ null
export const appleDocumentationDataUrl = (url: string): string | null => {
  const { hostname, pathname } = new URL(url);
  const path = pathname.replace(/\/$/u, '');
  if (
    hostname !== APPLE_DOCUMENTATION_HOST ||
    !APPLE_DOCUMENTATION_PATH.test(path)
  ) {
    return null;
  }
  return `https://${APPLE_DOCUMENTATION_HOST}/tutorials/data${path}.json`;
};

const CONTENT_KEYS = ['content', 'inlineContent', 'items'] as const;

const collectText = (node: unknown, texts: string[]): void => {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectText(child, texts);
    }
    return;
  }
  if (typeof node !== 'object' || node === null) {
    return;
  }
  const record = node as Record<string, unknown>;
  for (const key of ['text', 'code'] as const) {
    if (typeof record[key] === 'string') {
      texts.push(record[key]);
    }
  }
  for (const key of CONTENT_KEYS) {
    collectText(record[key], texts);
  }
};

// ドキュメントの JSON の本文（primaryContentSections）から、見出しと段落と箇条書きの字を順に取り出す
export const extractAppleDocumentationText = (data: unknown): string => {
  const texts: string[] = [];
  if (typeof data === 'object' && data !== null) {
    collectText(
      (data as Record<string, unknown>)['primaryContentSections'],
      texts,
    );
  }
  return texts.join(' ').replaceAll(/\s+/gu, ' ').trim();
};
