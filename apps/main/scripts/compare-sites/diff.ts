export type FieldDiff = {
  readonly field: string;
  readonly base: string | null;
  readonly head: string | null;
};

type Fields = ReadonlyMap<string, string>;

// 応答の種類が違えば中身の項目はすべて食い違うので、先にこの2つだけを比べる
const GATE_FIELDS = ['status', 'content-type'];

const diffOf = (field: string, base: Fields, head: Fields): FieldDiff[] => {
  const baseValue = base.get(field) ?? null;
  const headValue = head.get(field) ?? null;
  return baseValue === headValue
    ? []
    : [{ field, base: baseValue, head: headValue }];
};

const isIgnored = (diff: FieldDiff, patterns: readonly RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(diff.field));

export const diffFields = (
  base: Fields,
  head: Fields,
  patterns: readonly RegExp[],
): FieldDiff[] => {
  const gate = GATE_FIELDS.flatMap((field) => diffOf(field, base, head));
  if (gate.some((diff) => !isIgnored(diff, patterns))) {
    return gate;
  }
  const fields = new Set([...base.keys(), ...head.keys()]);
  return [...fields].flatMap((field) => diffOf(field, base, head));
};

export const partitionIgnored = (
  diffs: readonly FieldDiff[],
  patterns: readonly RegExp[],
): { reported: FieldDiff[]; ignored: FieldDiff[] } => ({
  reported: diffs.filter((diff) => !isIgnored(diff, patterns)),
  ignored: diffs.filter((diff) => isIgnored(diff, patterns)),
});

const SHORT_LENGTH = 120;
const CONTEXT_LENGTH = 40;

const excerptAt = (value: string, index: number): string => {
  const lineStart = index === 0 ? 0 : value.lastIndexOf('\n', index - 1) + 1;
  const lineEndIndex = value.indexOf('\n', index);
  const line = value.slice(
    lineStart,
    lineEndIndex === -1 ? value.length : lineEndIndex,
  );
  const column = index - lineStart;
  const start = Math.max(0, column - CONTEXT_LENGTH);
  const end = column + CONTEXT_LENGTH + 1;
  const lineNumber = value.slice(0, lineStart).split('\n').length;
  return `${String(lineNumber)}行目: ${start > 0 ? '…' : ''}${line.slice(start, end)}${end < line.length ? '…' : ''}`;
};

const isShort = (value: string): boolean =>
  value.length <= SHORT_LENGTH && !value.includes('\n');

const countLines = (value: string): number =>
  value.split('\n').length - (value.endsWith('\n') ? 1 : 0);

const excerptAlone = (value: string | null): string => {
  if (value === null) {
    return '(無し)';
  }
  return isShort(value)
    ? value
    : `${excerptAt(value, 0)}（全${String(countLines(value))}行・${String(value.length)}字）`;
};

export const excerptPair = (
  base: string | null,
  head: string | null,
): { base: string; head: string } => {
  if (base === null || head === null) {
    return { base: excerptAlone(base), head: excerptAlone(head) };
  }
  if (isShort(base) && isShort(head)) {
    return { base, head };
  }
  let index = 0;
  while (
    index < base.length &&
    index < head.length &&
    base[index] === head[index]
  ) {
    index += 1;
  }
  return { base: excerptAt(base, index), head: excerptAt(head, index) };
};
