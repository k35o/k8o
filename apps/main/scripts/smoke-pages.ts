import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { chromium } from 'playwright';

import {
  BYPASS_ENV,
  bypassHeaders,
  readBypassSecret,
} from './compare-sites/bypass';
import { parseSitemapPaths, resolveOn } from './compare-sites/targets';
import { findLeakedRequests, readNetLogLines } from './smoke-pages/net-log';
import type { LeakedRequest } from './smoke-pages/net-log';
import {
  newProblems,
  renderScreenshotIndex,
  screenshotFileOf,
  summarizeReportOnly,
} from './smoke-pages/report';
import type { Site } from './smoke-pages/report';
import type { BlockedCategory, BlockedRequest } from './smoke-pages/requests';
import { smokeTargets } from './smoke-pages/targets';
import { visitPage } from './smoke-pages/visit';
import type { Visit } from './smoke-pages/visit';

const { values } = parseArgs({
  options: {
    base: { type: 'string' },
    head: { type: 'string' },
    only: { type: 'string', multiple: true, default: [] },
    out: { type: 'string' },
  },
});
if (values.base === undefined) {
  console.error(
    '使い方: pnpm run -F main smoke:pages --base <URL> [--head <URL>] [--only <開くパスに合わせる正規表現>]... [--out <スクリーンショットを書くディレクトリ>]',
  );
  process.exit(2);
}
const { base, head } = values;
const baseSite: Site = { side: 'base', origin: new URL(base).origin };
const sides: readonly Site[] =
  head === undefined
    ? [baseSite]
    : [baseSite, { side: 'head', origin: new URL(head).origin }];
const onlyPatterns = values.only.map((pattern) => new RegExp(pattern, 'u'));
const bypassSecret = readBypassSecret(
  sides.map(({ origin }) => origin),
  process.env[BYPASS_ENV],
);

// no-console が console.log を警告するので、結果は標準出力へ直接書く
const print = (text: string): void => {
  process.stdout.write(`${text}\n`);
};

const CATEGORY_LABELS: Record<BlockedCategory, string> = {
  api: 'api の書き込み',
  ga: 'GA ほか Google の計測',
  'speed-insights': 'Speed Insights',
};

const countByCategory = (
  requests: ReadonlyArray<BlockedRequest | LeakedRequest>,
): string =>
  Object.entries(CATEGORY_LABELS)
    .map(
      ([category, label]) =>
        `${label} ${String(requests.filter((request) => request.category === category).length)}`,
    )
    .join('・');

type PageResult = {
  readonly path: string;
  readonly side: Site['side'];
  readonly origin: string;
  readonly visit: Visit;
};

const formatResult = ({ path, side, visit }: PageResult): string =>
  [
    `${path} [${side}] ${visit.status === null ? '応答なし' : String(visit.status)}`,
    ...visit.problems.map((problem) => `  誤り: ${problem}`),
    ...visit.notes.map((note) => `  参考: ${note}`),
  ].join('\n');

const sitemapUrl = resolveOn(base, '/sitemap.xml');
const sitemap = await fetch(sitemapUrl, {
  headers: bypassHeaders(sitemapUrl, bypassSecret),
});
if (!sitemap.ok) {
  throw new Error(
    `base の /sitemap.xml を取れない: HTTP ${String(sitemap.status)}`,
  );
}
const targets = smokeTargets(
  parseSitemapPaths(await sitemap.text()),
  onlyPatterns,
);

const outDir = targets.some(({ takesScreenshot }) => takesScreenshot)
  ? (values.out ?? (await mkdtemp(join(tmpdir(), 'k8o-smoke-pages-shots-'))))
  : null;
if (outDir !== null) {
  for (const { side } of sides) {
    await mkdir(join(outDir, side), { recursive: true });
  }
}

// netlog は要求のヘッダーもそのまま書くので、bypass の値を送るときは取らない
const netLogDir =
  bypassSecret === null
    ? await mkdtemp(join(tmpdir(), 'k8o-smoke-pages-'))
    : null;
const netLogFile = netLogDir === null ? null : join(netLogDir, 'netlog.json');

const results: PageResult[] = [];
const screenshotPaths: string[] = [];
let mitigated: string | null = null;
let leaked: LeakedRequest[] | null = null;
try {
  const browser = await chromium.launch({
    args: netLogFile === null ? [] : [`--log-net-log=${netLogFile}`],
  });
  try {
    // 本番の Firewall にヘッドレスの Chromium を咎められないよう、並べずに1枚ずつ開く
    for (const target of targets) {
      for (const { side, origin } of sides) {
        const visit = await visitPage(browser, {
          origin,
          path: target.path,
          expectedStatus: target.expectedStatus,
          checksNavigation: target.checksNavigation,
          screenshotPath:
            outDir !== null && target.takesScreenshot
              ? join(outDir, side, screenshotFileOf(target.path))
              : null,
          bypassSecret,
        });
        const result = { path: target.path, side, origin, visit };
        results.push(result);
        if (visit.problems.length > 0 || visit.notes.length > 0) {
          print(formatResult(result));
        }
        if (visit.mitigated !== null) {
          mitigated = `${target.path} [${side}]（x-vercel-mitigated: ${visit.mitigated}）`;
          break;
        }
      }
      if (mitigated !== null) {
        break;
      }
      if (target.takesScreenshot) {
        screenshotPaths.push(target.path);
      }
    }
  } finally {
    await browser.close();
  }
  if (netLogFile !== null) {
    leaked = await findLeakedRequests(readNetLogLines(netLogFile));
  }
} finally {
  if (netLogDir !== null) {
    await rm(netLogDir, { recursive: true, force: true });
  }
}

const resultsOf = (side: PageResult['side']): PageResult[] =>
  results.filter((result) => result.side === side);

for (const { side } of sides) {
  const reportOnly = summarizeReportOnly(
    resultsOf(side).map(({ visit }) => visit),
  );
  if (reportOnly.length > 0) {
    print(
      [
        `${side} の CSP の Report-Only の違反（失敗にしない）`,
        ...reportOnly.map(
          ({ kind, pages, example }) =>
            `  ${kind}: ${String(pages)} ページ（例: ${example}）`,
        ),
      ].join('\n'),
    );
  }
}

const increased = resultsOf('head').flatMap((headResult) => {
  const baseResult = results.find(
    ({ path, side }) => side === 'base' && path === headResult.path,
  );
  const problems =
    baseResult === undefined
      ? headResult.visit.problems
      : newProblems(
          { origin: baseResult.origin, problems: baseResult.visit.problems },
          { origin: headResult.origin, problems: headResult.visit.problems },
        );
  return problems.map((problem) => `  ${headResult.path}: ${problem}`);
});
if (increased.length > 0) {
  print(['head で増えた誤り', ...increased].join('\n'));
}

if (mitigated !== null) {
  print(`Firewall に止められたので、ここで止めた: ${mitigated}`);
}
if (leaked !== null && leaked.length > 0) {
  print(
    [
      '止められずに外へ出た要求',
      ...leaked.map(
        ({ category, method, url }) =>
          `  ${CATEGORY_LABELS[category]}: ${method} ${url}`,
      ),
    ].join('\n'),
  );
}
if (outDir !== null && screenshotPaths.length > 0) {
  const index = join(outDir, 'index.html');
  await writeFile(index, renderScreenshotIndex(sides, screenshotPaths));
  print(`スクリーンショット: ${index}`);
}
print(
  [
    ...sides.map(({ side }) => {
      const sideResults = resultsOf(side);
      return `${side}: 開いたページ ${String(sideResults.length)} / 誤りのあるページ ${String(sideResults.filter(({ visit }) => visit.problems.length > 0).length)} / 止めた要求 ${countByCategory(sideResults.flatMap(({ visit }) => visit.blocked))}`;
    }),
    ...(head === undefined
      ? []
      : [`head で増えた誤り: ${String(increased.length)}`]),
    leaked === null
      ? '止められずに外へ出た要求: bypass の値を送るので netlog を取っておらず、見ていない'
      : `止められずに外へ出た要求: ${countByCategory(leaked)}`,
  ].join('\n'),
);
const failed =
  head === undefined
    ? resultsOf('base').some(({ visit }) => visit.problems.length > 0)
    : increased.length > 0;
process.exitCode =
  mitigated !== null || (leaked !== null && leaked.length > 0) || failed
    ? 1
    : 0;
