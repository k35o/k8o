// 記事本文（マークダウン）から推定読了時間（分）を算出する。
// 日本語(CJK)は文字数、英数字は単語数で見積もる。
// コードブロックは本文より読むのに時間がかかるため、低めのレートで別に算入する。
// インラインコード・画像・URL は読み飛ばされる前提で除外する。

const CJK_CHARS_PER_MINUTE = 500;
const WORDS_PER_MINUTE = 250;
const CODE_CHARS_PER_MINUTE = 300;

const CJK_RE = /[぀-ヿ㐀-䶿一-鿿ｦ-ﾟ]/gu;

export const estimateReadingTimeMinutes = (markdown: string): number => {
  // フェンスドコードブロックは本文と別レートで数えるため、中身の文字数を控えてから除去する
  let codeCharCount = 0;
  const withoutFencedCode = markdown.replaceAll(
    /```[^\n]*\n([\s\S]*?)```/gu,
    (_match, body: string) => {
      codeCharCount += body.length;
      return ' ';
    },
  );

  const text = withoutFencedCode
    // インラインコード
    .replaceAll(/`[^`]*`/gu, ' ')
    // 画像
    .replaceAll(/!\[[^\]]*\]\([^)]*\)/gu, ' ')
    // リンクはテキストのみ残す
    .replaceAll(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
    // 裸のURL
    .replaceAll(/https?:\/\/\S+/gu, ' ');

  const cjkCount = (text.match(CJK_RE) ?? []).length;

  const wordCount = text
    .replaceAll(CJK_RE, ' ')
    .split(/\s+/u)
    .filter((token) => /[a-z0-9]/iu.test(token)).length;

  const minutes = Math.ceil(
    cjkCount / CJK_CHARS_PER_MINUTE +
      wordCount / WORDS_PER_MINUTE +
      codeCharCount / CODE_CHARS_PER_MINUTE,
  );

  return Math.max(1, minutes);
};
