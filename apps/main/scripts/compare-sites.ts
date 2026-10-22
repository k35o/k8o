import { parseArgs } from 'node:util';

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
  parseSitemapPaths,
  resolveOn,
} from './compare-sites/targets';

type Comparison = {
  readonly label: string;
  readonly baseUrl: string;
  readonly headUrl: string;
  readonly accept: string | null;
};

const { values } = parseArgs({
  options: {
    base: { type: 'string' },
    head: { type: 'string' },
    ignore: { type: 'string', multiple: true, default: [] },
  },
});
if (values.base === undefined || values.head === undefined) {
  console.error(
    '使い方: pnpm run -F main compare:sites --base <URL> --head <URL> [--ignore <項目の名前に合わせる正規表現>]...',
  );
  process.exit(2);
}
const { base, head } = values;
const ignorePatterns = values.ignore.map((pattern) => new RegExp(pattern, 'u'));

const fetchSnapshot = async (
  url: string,
  accept: string | null,
): Promise<Snapshot> => {
  const response = await fetch(url, {
    // 末尾のスラッシュなどのリダイレクトも外との約束なので、追わずに status と Location で比べる
    redirect: 'manual',
    headers: accept === null ? {} : { accept },
  }).catch((error: unknown) => {
    throw new Error(`${url} を取れない`, { cause: error });
  });
  return takeSnapshot({
    url,
    status: response.status,
    contentType: response.headers.get('content-type'),
    location: response.headers.get('location'),
    body: new Uint8Array(await response.arrayBuffer()),
  });
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

const compare = async (
  comparison: Comparison,
): Promise<readonly [Snapshot, Snapshot] | null> => {
  try {
    const snapshots = await Promise.all([
      fetchSnapshot(comparison.baseUrl, comparison.accept),
      fetchSnapshot(comparison.headUrl, comparison.accept),
    ]);
    const [baseSnapshot, headSnapshot] = snapshots;
    comparedCount += 1;
    const { reported, ignored } = partitionIgnored(
      diffFields(baseSnapshot.fields, headSnapshot.fields, ignorePatterns),
      ignorePatterns,
    );
    reportedCount += reported.length;
    ignoredCount += ignored.length;
    if (reported.length > 0) {
      print(
        [comparison.label, ...reported.map((diff) => formatDiff(diff))].join(
          '\n',
        ),
      );
    }
    if (
      baseSnapshot.imageBytes !== null &&
      headSnapshot.imageBytes !== null &&
      baseSnapshot.imageBytes !== headSnapshot.imageBytes
    ) {
      byteNotes.push(
        `  ${comparison.label}: ${String(baseSnapshot.imageBytes)} → ${String(headSnapshot.imageBytes)} バイト`,
      );
    }
    return snapshots;
  } catch (error) {
    failures.push(
      `  ${comparison.label}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
};

const sitemap = await fetch(resolveOn(base, '/sitemap.xml'));
if (!sitemap.ok) {
  throw new Error(
    `base の /sitemap.xml を取れない: HTTP ${String(sitemap.status)}`,
  );
}

const ogImages = new Map<string, Comparison>();
for (const target of buildTargets(parseSitemapPaths(await sitemap.text()))) {
  const snapshots = await compare({
    label: target.label,
    baseUrl: resolveOn(base, target.path),
    headUrl: resolveOn(head, target.path),
    accept: target.accept,
  });
  const baseOgImage = snapshots?.[0].ogImage ?? null;
  const headOgImage = snapshots?.[1].ogImage ?? null;
  // base と head で URL が変わっても比べられるよう、同じページが指す画像どうしを比べる
  if (baseOgImage !== null && headOgImage !== null) {
    const key = `${baseOgImage} ${headOgImage}`;
    if (!ogImages.has(key)) {
      ogImages.set(key, {
        label: `${target.label} の og:image`,
        baseUrl: resolveOn(base, baseOgImage),
        headUrl: resolveOn(head, headOgImage),
        accept: null,
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
