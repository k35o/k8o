// RootLayout が読むブラウザ最低版フロアと、同じ版から作る .browserslistrc の生成。
// フロアはビルドのターゲットと同じ生成物から読むので、リポジトリにコミットする。
// active データセットとずれると外形監視(browser-support-monitor)が版を指定して
// 再生成し、PR を自動で出す。
//
// 実行: pnpm run -F main generate:browser-min-versions [version]
// version 省略時は上流の最新版を使う。

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { transformUpstreamData } from '@repo/helpers/baseline/transform-upstream';
import { renderBrowserslistrc } from '@repo/helpers/browser/browserslist';

const RELEASE_LATEST_URL =
  'https://github.com/web-platform-dx/web-features/releases/latest/download/data.json';
const TAG_PATTERN = /\/releases\/download\/v(\d+)\.(\d+)\.(\d+)\/data\.json$/u;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/u;

const discoverLatestVersion = async (): Promise<string> => {
  const res = await fetch(RELEASE_LATEST_URL, {
    method: 'HEAD',
    redirect: 'manual',
  });
  const location = res.headers.get('location') ?? '';
  const matched = TAG_PATTERN.exec(location);
  if (res.status !== 302 || matched === null) {
    throw new Error(
      `バージョンタグを解決できない: status=${String(res.status)} location=${location}`,
    );
  }
  return matched.slice(1).join('.');
};

const requested = process.argv[2];
if (requested !== undefined && !VERSION_PATTERN.test(requested)) {
  throw new Error(`バージョンの形式が不正: ${requested}`);
}
const version = requested ?? (await discoverLatestVersion());
const res = await fetch(
  `https://cdn.jsdelivr.net/npm/web-features@${version}/data.json`,
);
if (!res.ok) {
  throw new Error(`data.json の取得に失敗: HTTP ${String(res.status)}`);
}
const { dataset } = transformUpstreamData(await res.json(), version);

const outPath = join(
  import.meta.dirname,
  '../src/features/browser-support/infrastructure/browser-min-versions.json',
);
writeFileSync(
  outPath,
  `${JSON.stringify(
    {
      upstreamVersion: version,
      minVersions: dataset.minVersions,
    },
    null,
    2,
  )}\n`,
);
// ai の Next.js は browserslist を Lightning CSS と SWC のターゲットに使う。画面に出すフロアと
// 同じ版から作り、リポジトリ直下に置く
writeFileSync(
  join(import.meta.dirname, '../../../.browserslistrc'),
  renderBrowserslistrc(dataset.minVersions),
);
console.log(`generated: v${version}`, dataset.minVersions);
