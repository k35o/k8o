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

type SiteProblems = {
  readonly origin: string;
  readonly problems: readonly string[];
};

// 誤りの文には資源の URL が入るので、オリジンを除いてから比べる
const withoutOrigin = ({ origin, problems }: SiteProblems): string[] =>
  problems.map((problem) => problem.replaceAll(origin, '<origin>'));

export const newProblems = (
  base: SiteProblems,
  head: SiteProblems,
): string[] => {
  const known = new Set(withoutOrigin(base));
  const normalized = withoutOrigin(head);
  return head.problems.filter(
    (_, index) => !known.has(normalized[index] ?? ''),
  );
};

export const screenshotFileOf = (path: string): string =>
  `${path === '/' ? 'index' : path.slice(1).replaceAll(/[^a-z0-9-]/gu, '_')}.jpeg`;

const escapeHtml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export type Site = {
  readonly side: 'base' | 'head';
  readonly origin: string;
};

export const renderScreenshotIndex = (
  sides: readonly Site[],
  paths: readonly string[],
): string => {
  const sections = paths.map((path) => {
    const figures = sides.map(({ side, origin }) => {
      const src = `${side}/${screenshotFileOf(path)}`;
      return `<figure><figcaption>${side}: ${escapeHtml(origin)}</figcaption><a href="${src}"><img src="${src}" alt="${side} の ${escapeHtml(path)}" loading="lazy"></a></figure>`;
    });
    return `<section><h2>${escapeHtml(path)}</h2><div class="sides">${figures.join('')}</div></section>`;
  });
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>smoke-pages のスクリーンショット</title>
<style>
body { margin: 16px; font-family: system-ui, sans-serif; }
.sides { display: grid; grid-template-columns: repeat(${String(sides.length)}, minmax(0, 1fr)); gap: 16px; }
figure { margin: 0; }
img { width: 100%; height: auto; border: 1px solid #8888; }
</style>
</head>
<body>
${sections.join('\n')}
</body>
</html>
`;
};
