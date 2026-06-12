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
  // og: OGP画像に使う代表コードブロックの印。表示には影響しない
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
