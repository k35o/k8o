export type DeckSlide = {
  // Notes / Cover タグを取り除いた後の Markdown ソース。
  source: string;
  notes: string[];
  isCover: boolean;
};

const SEPARATOR = /^---\s*$/u;
const FENCE_OPEN = /^(`{3,})/u;
const NOTES_BLOCK = /<Notes>([\s\S]*?)<\/Notes>/gu;
// ストリーミング途中の閉じタグ未到達（<Notes> だけ届いた状態）。
const NOTES_OPEN_ONLY = /<Notes>([\s\S]*)$/u;
const COVER_OPEN = /^<Cover>\s*/u;
const COVER_CLOSE = /\s*<\/Cover>\s*$/u;
// ストリーミング途中でタグが途切れた末尾（例: "<Cov" "</Note"）。本文に混ぜず捨てる。
const TRAILING_PARTIAL_TAG = /<\/?[A-Z][A-Za-z]*$/u;

// コードフェンス内の --- で誤分割しないよう、フェンス状態を追いながら区切り行で分割する。
const splitBySeparator = (source: string): string[] => {
  const chunks: string[] = [];
  let current: string[] = [];
  let fence: number | null = null;
  for (const line of source.split('\n')) {
    const fenceMatch = FENCE_OPEN.exec(line.trimStart());
    if (fenceMatch?.[1] !== undefined) {
      const { length } = fenceMatch[1];
      if (fence === null) {
        fence = length;
      } else if (length >= fence && line.trim() === '`'.repeat(length)) {
        fence = null;
      }
    }
    if (fence === null && SEPARATOR.test(line)) {
      chunks.push(current.join('\n'));
      current = [];
      continue;
    }
    current.push(line);
  }
  chunks.push(current.join('\n'));
  return chunks;
};

const parseSlide = (chunk: string): DeckSlide => {
  const notes: string[] = [];
  let rest = chunk.replace(NOTES_BLOCK, (_, body: string) => {
    const trimmed = body.trim();
    if (trimmed !== '') {
      notes.push(trimmed);
    }
    return '';
  });
  rest = rest.replace(NOTES_OPEN_ONLY, (_, body: string) => {
    const trimmed = body.trim();
    if (trimmed !== '') {
      notes.push(trimmed);
    }
    return '';
  });
  rest = rest.replace(TRAILING_PARTIAL_TAG, '');

  let source = rest.trim();
  const isCover = COVER_OPEN.test(source);
  if (isCover) {
    source = source.replace(COVER_OPEN, '').replace(COVER_CLOSE, '').trim();
  }
  return { source, notes, isCover };
};

const isEmptySlide = (slide: DeckSlide): boolean =>
  slide.source === '' && slide.notes.length === 0;

// 生成中の不完全なソース（未閉タグ・末尾の区切り直後など）にも耐える。
export const parseDeck = (source: string): DeckSlide[] => {
  if (source.trim() === '') {
    return [];
  }
  const slides = splitBySeparator(source).map((chunk) => parseSlide(chunk));
  // 末尾の空スライド（`---` の直後で入力が終わっている等）は落とす。
  while (slides.length > 0) {
    const last = slides.at(-1);
    if (last === undefined || !isEmptySlide(last)) {
      break;
    }
    slides.pop();
  }
  return slides;
};
