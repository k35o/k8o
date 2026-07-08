export type Annotation =
  | { type: 'highlight' }
  | { type: 'add' }
  | { type: 'remove' }
  | { type: 'callout'; text: string }
  | { type: 'og' };

type ParseResult = {
  code: string;
  annotations: Annotation[][];
};

const COMMENT_PATTERNS: readonly RegExp[] = [
  /^\s*\/\/\s*\[!([^\]]+)\]\s*$/u,
  /^\s*#\s*\[!([^\]]+)\]\s*$/u,
  /^\s*--\s*\[!([^\]]+)\]\s*$/u,
  /^\s*<!--\s*\[!([^\]]+)\]\s*-->\s*$/u,
  /^\s*\/\*\s*\[!([^\]]+)\]\s*\*\/\s*$/u,
];

const parseDirective = (raw: string): Annotation | null => {
  const directive = raw.trim();
  if (directive === 'hl' || directive === 'highlight') {
    return { type: 'highlight' };
  }
  if (directive === '+') return { type: 'add' };
  if (directive === '-') return { type: 'remove' };
  if (directive === 'og') return { type: 'og' };

  // \s* の直後を \S で始めて境界を一意にする (CodeQL: js/polynomial-redos)
  const callout = /^callout:\s*(\S.*)$/u.exec(directive);
  if (callout) {
    const text = callout[1]?.trim();
    if (text !== undefined && text.length > 0) {
      return { type: 'callout', text };
    }
  }
  return null;
};

const matchDirectiveLine = (line: string): Annotation | null => {
  for (const pattern of COMMENT_PATTERNS) {
    const matched = pattern.exec(line);
    if (matched?.[1] !== undefined) {
      const directive = parseDirective(matched[1]);
      if (directive) return directive;
    }
  }
  return null;
};

// markdown配信などレンダリングを伴わない出力向けに、注釈ディレクティブ行を除去する。
// コールアウトは本文が読者向けの説明なので、コメント記法を保ったまま本文だけ残す。
export const stripAnnotationComments = (code: string): string => {
  const outLines: string[] = [];
  for (const line of code.split('\n')) {
    const directive = matchDirectiveLine(line);
    if (directive === null) {
      outLines.push(line);
      continue;
    }
    if (directive.type === 'callout') {
      // matchDirectiveLine を通った行は [! と閉じ ] を必ず1組含むので、
      // 正規表現を使わず位置で置換する (CodeQL: js/polynomial-redos 回避)
      const start = line.indexOf('[!');
      const end = line.indexOf(']', start);
      outLines.push(
        `${line.slice(0, start)}${directive.text}${line.slice(end + 1)}`,
      );
    }
  }
  return outLines.join('\n');
};

export const parseAnnotations = (code: string): ParseResult => {
  const lines = code.split('\n');
  const outLines: string[] = [];
  const annotations: Annotation[][] = [];
  let pending: Annotation[] = [];

  for (const line of lines) {
    const directive = matchDirectiveLine(line);
    if (directive) {
      pending.push(directive);
      continue;
    }
    outLines.push(line);
    annotations.push(pending);
    pending = [];
  }

  return { code: outLines.join('\n'), annotations };
};
