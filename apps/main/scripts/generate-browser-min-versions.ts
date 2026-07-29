// RootLayout が読むブラウザ最低版フロアの生成。フロアは全ページの静的シェルを握る
// ため実行時 I/O(DB・ネットワーク)に依存させず、生成物をリポジトリにコミットする。
// 上流でフロアが変わると admin の同期 cron が push 通知で再生成を促す。
//
// 実行: pnpm run -F main generate:browser-min-versions

// Node の TS 実行は node_modules 配下の型ストリップを拒否するため、@repo/helpers は
// パッケージ名ではなく実パスの相対 import で読む。
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// 拡張子なしの相対 import は register-ts-resolver が実行時に .ts へ補完する
import { transformUpstreamData } from '../../../packages/helpers/src/baseline/transform-upstream';

const RELEASE_LATEST_URL =
  'https://github.com/web-platform-dx/web-features/releases/latest/download/data.json';
const TAG_PATTERN = /\/releases\/download\/v(\d+)\.(\d+)\.(\d+)\/data\.json$/u;

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
  const [, major, minor, patch] = matched;
  return `${major}.${minor}.${patch}`;
};

const version = await discoverLatestVersion();
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
      generatedAt: new Date().toISOString().slice(0, 10),
      minVersions: dataset.minVersions,
    },
    null,
    2,
  )}\n`,
);
console.log(`generated: v${version}`, dataset.minVersions);
