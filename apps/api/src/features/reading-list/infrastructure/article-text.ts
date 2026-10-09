import { Readability } from '@mozilla/readability';
import { safeFetch } from '@repo/helpers/url/safe-fetch';
import { parseHTML } from 'linkedom';

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = 'Mozilla/5.0 (compatible; k8o-bot/1.0; +https://k8o.me)';
// 記事の HTML はふつう数百 KB まで。数 MB の HTML は DOM にすると GB 単位のメモリを使い、
// 関数ごと落ちるので、上限で切って途中までを読む（HTML パーサは途中で切れても読める）
const MAX_HTML_BYTES = 3_000_000;
// Readability は class・id・role でしかナビゲーションを外さない。class の無いサイトの
// メニューが本文に混ざらないよう、タグ名で先に外す（header は記事のリード文を含むので残す）
const NON_ARTICLE_SELECTOR = 'nav';

export type ArticleTextResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

export const extractArticleText = (html: string): string => {
  const { document } = parseHTML(html);
  for (const element of document.querySelectorAll(NON_ARTICLE_SELECTOR)) {
    element.remove();
  }
  // textContent は段落や見出しの境目に区切りを入れず、文や単語がつながってしまう
  const article = new Readability(document, {
    serializer: (node) => (node as HTMLElement).innerText,
  }).parse();
  return (article?.content ?? '').replaceAll(/\s+/gu, ' ').trim();
};

const readTextWithLimit = async (response: Response): Promise<string> => {
  if (response.body === null) {
    return '';
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  while (bytes < MAX_HTML_BYTES) {
    // oxlint-disable-next-line eslint/no-await-in-loop -- ストリームは順に読むしかない
    const { done, value } = await reader.read();
    if (done) {
      return text + decoder.decode();
    }
    bytes += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }
  await reader.cancel();
  return text + decoder.decode();
};

export async function fetchArticleText(
  url: string,
): Promise<ArticleTextResult> {
  try {
    // SSRF 対策: 公開 https URL のみ許可し、リダイレクト先も都度検証する
    const response = await safeFetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (!/^(?:text\/html|application\/xhtml\+xml)/iu.test(contentType)) {
      return { ok: false, reason: `HTML ではない（${contentType}）` };
    }
    return {
      ok: true,
      text: extractArticleText(await readTextWithLimit(response)),
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
