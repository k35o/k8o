import type {
  OxlintRawDiagnostic,
  OxlintRawOutput,
} from '../infrastructure/oxlint-runner';

type LintSeverity = 'error' | 'warning';

export type LintDiagnostic = {
  message: string;
  /** 'eslint(no-var)' のようなルールコード。構文エラー等では null */
  code: string | null;
  severity: LintSeverity;
  /** ルールドキュメントの URL */
  url: string | null;
  help: string | null;
  /** 1 始まり。位置情報が無い診断では null */
  line: number | null;
  column: number | null;
};

const toDiagnostic = (raw: OxlintRawDiagnostic): LintDiagnostic => {
  const span = raw.labels?.[0]?.span;
  return {
    message: raw.message ?? '',
    code: raw.code === undefined || raw.code === '' ? null : raw.code,
    severity: raw.severity === 'warning' ? 'warning' : 'error',
    url: raw.url ?? null,
    help: raw.help ?? null,
    line: span?.line ?? null,
    column: span?.column ?? null,
  };
};

const positionOrder = (diagnostic: LintDiagnostic): [number, number] => [
  diagnostic.line ?? Number.MAX_SAFE_INTEGER,
  diagnostic.column ?? Number.MAX_SAFE_INTEGER,
];

export const toLintDiagnostics = (raw: OxlintRawOutput): LintDiagnostic[] =>
  raw.diagnostics.map(toDiagnostic).toSorted((a, b) => {
    const [aLine, aColumn] = positionOrder(a);
    const [bLine, bColumn] = positionOrder(b);
    return aLine === bLine ? aColumn - bColumn : aLine - bLine;
  });
