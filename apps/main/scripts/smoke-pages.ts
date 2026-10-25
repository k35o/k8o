import { mkdtemp, rm } from 'node:fs/promises';
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
import { summarizeReportOnly } from './smoke-pages/report';
import type { BlockedCategory } from './smoke-pages/requests';
import { smokeTargets } from './smoke-pages/targets';
import { visitPage } from './smoke-pages/visit';
import type { BlockedRequest, Visit } from './smoke-pages/visit';

const { values } = parseArgs({
  options: {
    base: { type: 'string' },
    only: { type: 'string', multiple: true, default: [] },
  },
});
if (values.base === undefined) {
  console.error(
    '使い方: pnpm run -F main smoke:pages --base <URL> [--only <開くパスに合わせる正規表現>]...',
  );
  process.exit(2);
}
const { base } = values;
const { origin } = new URL(base);
const onlyPatterns = values.only.map((pattern) => new RegExp(pattern, 'u'));
const bypassSecret = readBypassSecret([base], process.env[BYPASS_ENV]);

// no-console が console.log を警告するので、結果は標準出力へ直接書く
const print = (text: string): void => {
  process.stdout.write(`${text}\n`);
};

const CATEGORY_LABELS: Record<BlockedCategory, string> = {
  api: 'api の書き込み',
  ga: 'GA',
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

const formatVisit = (path: string, visit: Visit): string =>
  [
    `${path} ${visit.status === null ? '応答なし' : String(visit.status)}`,
    ...visit.problems.map((problem) => `  誤り: ${problem}`),
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

// netlog は要求のヘッダーもそのまま書くので、bypass の値を送るときは取らない
const netLogDir =
  bypassSecret === null
    ? await mkdtemp(join(tmpdir(), 'k8o-smoke-pages-'))
    : null;
const netLogFile = netLogDir === null ? null : join(netLogDir, 'netlog.json');

const visits: Visit[] = [];
let mitigated: string | null = null;
let leaked: LeakedRequest[] | null = null;
try {
  const browser = await chromium.launch({
    args: netLogFile === null ? [] : [`--log-net-log=${netLogFile}`],
  });
  try {
    // 本番の Firewall にヘッドレスの Chromium を咎められないよう、並べずに1枚ずつ開く
    for (const { path, expectedStatus } of targets) {
      const visit = await visitPage(browser, {
        origin,
        path,
        expectedStatus,
        bypassSecret,
      });
      visits.push(visit);
      if (visit.problems.length > 0) {
        print(formatVisit(path, visit));
      }
      if (visit.mitigated !== null) {
        mitigated = `${path}（x-vercel-mitigated: ${visit.mitigated}）`;
        break;
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

const reportOnly = summarizeReportOnly(visits);
if (reportOnly.length > 0) {
  print(
    [
      'CSP の Report-Only の違反（失敗にしない）',
      ...reportOnly.map(
        ({ kind, pages, example }) =>
          `  ${kind}: ${String(pages)} ページ（例: ${example}）`,
      ),
    ].join('\n'),
  );
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
print(
  [
    `開いたページ: ${String(visits.length)} / 誤りのあるページ: ${String(visits.filter((visit) => visit.problems.length > 0).length)}`,
    `止めた要求: ${countByCategory(visits.flatMap((visit) => visit.blocked))}`,
    leaked === null
      ? '止められずに外へ出た要求: bypass の値を送るので netlog を取っておらず、見ていない'
      : `止められずに外へ出た要求: ${countByCategory(leaked)}`,
  ].join('\n'),
);
process.exitCode =
  mitigated !== null ||
  (leaked !== null && leaked.length > 0) ||
  visits.some((visit) => visit.problems.length > 0)
    ? 1
    : 0;
