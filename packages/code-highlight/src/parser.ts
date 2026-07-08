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

  const callout = /^callout:\s*(.+)$/u.exec(directive);
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

// \s は [^\]] に含まれるため \s* を挟むと曖昧になり、バックトラックが
// 多項式時間になる (CodeQL: js/polynomial-redos)。マッチ範囲は同一。
const CALLOUT_DIRECTIVE_RE = /\[!callout:[^\]]+\]/u;

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
      outLines.push(line.replace(CALLOUT_DIRECTIVE_RE, () => directive.text));
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
