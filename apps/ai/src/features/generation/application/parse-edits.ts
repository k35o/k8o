// 差分編集（```edits フェンス内の SEARCH/REPLACE ブロック）のパースと適用。
// 全文再生成に比べて出力トークンと待ち時間を大きく削れる。ストリーミング途中でも
// REPLACE 終端まで届いたブロックだけを返し、逐次適用でプレビューできるようにする。

export type EditBlock = {
  readonly search: string;
  readonly replace: string;
};

export type ParsedEdits = {
  // REPLACE 終端まで届いた完成ブロックのみ（書きかけの末尾ブロックは含めない）。
  readonly blocks: readonly EditBlock[];
  // ```edits フェンスが現れたか（= 応答が差分編集形式か）。
  readonly isOpen: boolean;
  // フェンスが閉じたか。
  readonly isComplete: boolean;
};

const EDITS_OPEN = '```edits';
const SEARCH_MARK = '<<<<<<< SEARCH';
const DIVIDER_MARK = '=======';
const REPLACE_MARK = '>>>>>>> REPLACE';
const FENCE_CLOSE_RE = /^```\s*$/mu;

export const parseEdits = (raw: string): ParsedEdits => {
  const open = raw.indexOf(EDITS_OPEN);
  if (open === -1) {
    return { blocks: [], isOpen: false, isComplete: false };
  }
  const afterOpen = raw.indexOf('\n', open);
  if (afterOpen === -1) {
    return { blocks: [], isOpen: true, isComplete: false };
  }
  const rest = raw.slice(afterOpen + 1);
  const close = rest.search(FENCE_CLOSE_RE);
  const body = close === -1 ? rest : rest.slice(0, close);

  const blocks: EditBlock[] = [];
  let phase: 'idle' | 'search' | 'replace' = 'idle';
  let search: string[] = [];
  let replace: string[] = [];
  for (const line of body.split('\n')) {
    const marker = line.trim();
    if (phase === 'idle') {
      if (marker === SEARCH_MARK) {
        phase = 'search';
        search = [];
        replace = [];
      }
      continue;
    }
    if (phase === 'search') {
      if (marker === DIVIDER_MARK) {
        phase = 'replace';
        continue;
      }
      search.push(line);
      continue;
    }
    if (marker === REPLACE_MARK) {
      blocks.push({ search: search.join('\n'), replace: replace.join('\n') });
      phase = 'idle';
      continue;
    }
    replace.push(line);
  }

  return { blocks, isOpen: true, isComplete: close !== -1 };
};

const linesMatchAt = (
  base: readonly string[],
  search: readonly string[],
  start: number,
  loose: boolean,
): boolean => {
  for (const [offset, line] of search.entries()) {
    const baseLine = base[start + offset];
    if (baseLine === undefined) {
      return false;
    }
    if (loose ? baseLine.trimEnd() !== line.trimEnd() : baseLine !== line) {
      return false;
    }
  }
  return true;
};

const findLineMatch = (
  base: readonly string[],
  search: readonly string[],
  loose: boolean,
): number => {
  for (let start = 0; start + search.length <= base.length; start += 1) {
    if (linesMatchAt(base, search, start, loose)) {
      return start;
    }
  }
  return -1;
};

// 1ブロックを適用する。SEARCH は「連続した行」の意味なので行単位で照合する
// （部分文字列では行の途中に誤って一致しうる）。まず行の完全一致、だめなら
// 行末空白を無視した一致で探す（モデルが行末空白を落とすことがあるため）。
const applyBlock = (code: string, block: EditBlock): string | null => {
  if (block.search === '') {
    return null;
  }
  const codeLines = code.split('\n');
  const searchLines = block.search.split('\n');
  const strict = findLineMatch(codeLines, searchLines, false);
  const start =
    strict === -1 ? findLineMatch(codeLines, searchLines, true) : strict;
  if (start === -1) {
    return null;
  }
  const replaceLines = block.replace === '' ? [] : block.replace.split('\n');
  return [
    ...codeLines.slice(0, start),
    ...replaceLines,
    ...codeLines.slice(start + searchLines.length),
  ].join('\n');
};

export type AppliedEdits = {
  // 適用後のコード（失敗ブロックは飛ばした best-effort）。
  readonly code: string;
  // 一致せず適用できなかったブロックの番号（1始まり）。
  readonly failed: readonly number[];
};

// ブロックを上から順に適用する。各ブロックは最初の一致箇所だけを置き換える。
export const applyEdits = (
  base: string,
  blocks: readonly EditBlock[],
): AppliedEdits => {
  let code = base;
  const failed: number[] = [];
  for (const [index, block] of blocks.entries()) {
    const next = applyBlock(code, block);
    if (next === null) {
      failed.push(index + 1);
      continue;
    }
    code = next;
  }
  return { code, failed };
};
