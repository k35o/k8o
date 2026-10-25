import type { Visit } from './visit';

type ReportOnlySummary = {
  readonly kind: string;
  readonly pages: number;
  readonly example: string;
};

// Trusted Types の sample は「sink|値の先頭」で、値はページごとに変わる
const kindOf = (violation: string): string => violation.replace(/\|.*$/su, '');

export const summarizeReportOnly = (
  visits: ReadonlyArray<Pick<Visit, 'reportOnly'>>,
): ReportOnlySummary[] => {
  const summaries = new Map<string, ReportOnlySummary>();
  for (const { reportOnly } of visits) {
    const examples = new Map<string, string>();
    for (const violation of reportOnly) {
      if (!examples.has(kindOf(violation))) {
        examples.set(kindOf(violation), violation);
      }
    }
    for (const [kind, example] of examples) {
      const summary = summaries.get(kind);
      summaries.set(
        kind,
        summary === undefined
          ? { kind, pages: 1, example }
          : { ...summary, pages: summary.pages + 1 },
      );
    }
  }
  return [...summaries.values()];
};
