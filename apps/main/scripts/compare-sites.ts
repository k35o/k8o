import { parseArgs } from 'node:util';

import { applyAllowances, selectAllowances } from './compare-sites/allowances';
import {
  BYPASS_ENV,
  bypassHeaders,
  readBypassSecret,
} from './compare-sites/bypass';
import {
  diffFields,
  excerptPair,
  partitionIgnored,
} from './compare-sites/diff';
import type { FieldDiff } from './compare-sites/diff';
import { takeSnapshot } from './compare-sites/snapshot';
import type { Snapshot } from './compare-sites/snapshot';
import {
  buildTargets,
  filterTargets,
  parseSitemapPaths,
  resolveOn,
} from './compare-sites/targets';
import type { Target } from './compare-sites/targets';

type Comparison = {
  readonly target: Target;
  readonly baseUrl: string;
  readonly headUrl: string;
};

const { values } = parseArgs({
  options: {
    base: { type: 'string' },
    head: { type: 'string' },
    only: { type: 'string', multiple: true, default: [] },
    allow: { type: 'string', multiple: true, default: [] },
    ignore: { type: 'string', multiple: true, default: [] },
  },
});
if (values.base === undefined || values.head === undefined) {
  console.error(
    '使い方: pnpm run -F main compare:sites --base <URL> --head <URL> [--only <比べるパスに合わせる正規表現>]... [--allow <許す差の名前>]... [--ignore <項目の名前に合わせる正規表現>]...',
  );
  process.exit(2);
}
const { base, head } = values;
const onlyPatterns = values.only.map((pattern) => new RegExp(pattern, 'u'));
const allowances = selectAllowances(values.allow);
const bypassSecret = readBypassSecret([base, head], process.env[BYPASS_ENV]);
const ignorePatterns = values.ignore.map((pattern) => new RegExp(pattern, 'u'));

const fetchOnce = async (url: string, target: Target): Promise<Response> =>
  fetch(url, {
    method: target.method,
    // 末尾のスラッシュなどのリダイレクトも外との約束なので、追わずに status と Location で比べる
    redirect: 'manual',
    headers: {
      ...(target.accept === null ? {} : { accept: target.accept }),
      ...bypassHeaders(url, bypassSecret),
    },
  }).catch((error: unknown) => {
    throw new Error(`${url} を取れない`, { cause: error });
  });

const fetchSnapshot = async (
  url: string,
  target: Target,
): Promise<Snapshot> => {
  if (target.checksCdnCache) {
    // 1回目で CDN に載せ、2回目の x-vercel-cache で中継の応答がキャッシュされるかを見る
    await (await fetchOnce(url, target)).arrayBuffer();
  }
  const response = await fetchOnce(url, target);
  return takeSnapshot(
    {
      url,
      status: response.status,
      headers: response.headers,
      body: new Uint8Array(await response.arrayBuffer()),
    },
    target.checksCdnCache ? ['x-vercel-cache'] : [],
  );
};

// no-console が console.log を警告するので、結果は標準出力へ直接書く
const print = (text: string): void => {
  process.stdout.write(`${text}\n`);
};

const formatDiff = (diff: FieldDiff): string => {
  const { base: baseValue, head: headValue } = excerptPair(
    diff.base,
    diff.head,
  );
  return `  ${diff.field}\n    base: ${baseValue}\n    head: ${headValue}`;
};

let comparedCount = 0;
let reportedCount = 0;
let ignoredCount = 0;
const byteNotes: string[] = [];
const failures: string[] = [];

const compare = async ({
  target,
  baseUrl,
  headUrl,
}: Comparison): Promise<readonly [Snapshot, Snapshot] | null> => {
  try {
    const snapshots = await Promise.all([
      fetchSnapshot(baseUrl, target),
      fetchSnapshot(headUrl, target),
    ]);
    const [baseSnapshot, headSnapshot] = snapshots;
    comparedCount += 1;
    const { reported, ignored } = partitionIgnored(
      diffFields(
        applyAllowances(baseSnapshot.fields, target, headUrl, allowances),
        headSnapshot.fields,
        ignorePatterns,
      ),
      ignorePatterns,
    );
    reportedCount += reported.length;
    ignoredCount += ignored.length;
    if (reported.length > 0) {
      print(
        [target.label, ...reported.map((diff) => formatDiff(diff))].join('\n'),
      );
    }
    if (
      baseSnapshot.imageBytes !== null &&
      headSnapshot.imageBytes !== null &&
      baseSnapshot.imageBytes !== headSnapshot.imageBytes
    ) {
      byteNotes.push(
        `  ${target.label}: ${String(baseSnapshot.imageBytes)} → ${String(headSnapshot.imageBytes)} バイト`,
      );
    }
    return snapshots;
  } catch (error) {
    failures.push(
      `  ${target.label}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
};

const sitemapUrl = resolveOn(base, '/sitemap.xml');
const sitemap = await fetch(sitemapUrl, {
  headers: bypassHeaders(sitemapUrl, bypassSecret),
});
if (!sitemap.ok) {
  throw new Error(
    `base の /sitemap.xml を取れない: HTTP ${String(sitemap.status)}`,
  );
}

const targets = filterTargets(
  buildTargets(parseSitemapPaths(await sitemap.text())),
  onlyPatterns,
);
const targetLabels = new Set(targets.map((target) => target.label));
const ogImages = new Map<string, Comparison>();
for (const target of targets) {
  const snapshots = await compare({
    target,
    baseUrl: resolveOn(base, target.path),
    headUrl: resolveOn(head, target.path),
  });
  const baseOgImage = snapshots?.[0].ogImage ?? null;
  const headOgImage = snapshots?.[1].ogImage ?? null;
  // base と head で URL が変わっても比べられるよう、同じページが指す画像どうしを比べる
  if (baseOgImage !== null && headOgImage !== null) {
    const key = `${baseOgImage} ${headOgImage}`;
    const baseUrl = resolveOn(base, baseOgImage);
    const headUrl = resolveOn(head, headOgImage);
    const path = new URL(baseUrl).pathname;
    // 記事の og.png は対象として直接比べている
    const comparedDirectly =
      targetLabels.has(path) && new URL(headUrl).pathname === path;
    if (!comparedDirectly && !ogImages.has(key)) {
      ogImages.set(key, {
        target: {
          label: `${target.label} の og:image`,
          path,
          accept: null,
          method: 'GET',
          checksCdnCache: false,
        },
        baseUrl,
        headUrl,
      });
    }
  }
}
for (const comparison of ogImages.values()) {
  await compare(comparison);
}

if (byteNotes.length > 0) {
  print(['参考: 画像のバイト数の差（失敗にしない）', ...byteNotes].join('\n'));
}
if (failures.length > 0) {
  print(['取れなかった URL', ...failures].join('\n'));
}
print(
  `比べた URL: ${String(comparedCount)} / 差分: ${String(reportedCount)} / 無視した差分: ${String(ignoredCount)} / 取れなかった URL: ${String(failures.length)}`,
);
process.exitCode = reportedCount > 0 || failures.length > 0 ? 1 : 0;
