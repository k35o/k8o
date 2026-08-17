// sandbox-template を Vercel Sandbox に焼いて snapshot を作る（テンプレ・arte-odyssey 更新時に再実行）。
// snapshot ID と内容ハッシュは template-snapshot.ts に書き出してコミット管理する
// （env の手編集は不要。テンプレ変更時の焼き忘れは template-snapshot.test.ts が検知）。
// 認証は sandbox-config.ts の sandboxCreds() に集約。既定は OIDC で、VERCEL_TOKEN が
// あるときだけ明示認証する。
// 使い方: vercel env pull apps/ai/.env.local のあと
//   node --env-file=apps/ai/.env.local apps/ai/scripts/bake-sandbox-snapshot.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Sandbox } from '@vercel/sandbox';

import {
  SANDBOX_IMAGE,
  sandboxCreds,
} from '../src/features/preview/infrastructure/sandbox-config.ts';
import {
  collectTemplateFiles,
  computeTemplateHash,
} from '../src/features/preview/infrastructure/template-hash.ts';

// 焼いた snapshot の有効期限（最終使用からの寿命）。無期限(0)にすると再bakeのたびに
// 旧 snapshot が消えず蓄積するため、期限を設けて自然失効させる。アクティブな snapshot は
// runtime が起動のたびに last-used を更新するので失効しない。旧 snapshot はマージ後に
// 参照されなくなった時点から期限切れで自動削除される（renovate の再bake頻度＜本 window）。
const SNAPSHOT_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000;

const here = import.meta.dirname;
const templateDir = path.resolve(here, '..', 'sandbox-template');
const pointerPath = path.resolve(
  here,
  '..',
  'src/features/preview/infrastructure/template-snapshot.ts',
);

const absFiles = await collectTemplateFiles(templateDir);
const files = await Promise.all(
  absFiles.map(async (abs) => ({
    path: path.relative(templateDir, abs).split(path.sep).join('/'),
    content: await readFile(abs),
  })),
);
console.log(`template files (${files.length}):`);
for (const f of files) console.log(`  ${f.path}`);

console.log('creating sandbox...');
const sandbox = await Sandbox.create({
  image: SANDBOX_IMAGE,
  timeout: 10 * 60 * 1000,
  ...sandboxCreds(),
});
try {
  // writeFiles の相対パスも runCommand も session の既定 cwd（image の WORKDIR）を基準に
  // 解決されるため、作業ディレクトリは指定しない。
  await sandbox.writeFiles(files);
  console.log('files written. running `npm ci`...');
  const ci = await sandbox.runCommand({
    cmd: 'npm',
    args: ['ci'],
    timeoutMs: 8 * 60 * 1000,
  });
  console.log(`npm ci exit=${ci.exitCode}`);
  if (ci.exitCode !== 0) {
    console.error((await ci.stderr()).slice(-3000));
    throw new Error('npm ci failed');
  }
  console.log('snapshotting...');
  const snap = await sandbox.snapshot({ expiration: SNAPSHOT_EXPIRATION_MS });
  console.log(`\n==== AI_TEMPLATE_SNAPSHOT_ID=${snap.snapshotId} ====\n`);

  // 焼いた snapshot ID と、焼いた時点のテンプレ内容ハッシュをコミット管理ファイルに書き出す。
  // これによりデプロイは「コミットされたテンプレ ↔ 対応 snapshot」で常に一致する。
  const templateHash = await computeTemplateHash(templateDir);
  const pointer = `// このファイルは bake-sandbox-snapshot.mjs が自動生成する。手で編集しない。
// templateHash は sandbox-template の内容指紋。テンプレ変更時は再bakeで更新される
// （未更新だと template-snapshot.test.ts が落ちる）。snapshotId は焼いた snapshot の ID。
export const templateSnapshot = {
  templateHash:
    '${templateHash}',
  snapshotId: '${snap.snapshotId}',
} as const;
`;
  await writeFile(pointerPath, pointer, 'utf8');
  console.log(`wrote ${path.relative(process.cwd(), pointerPath)}`);
} finally {
  await sandbox.stop().catch(() => undefined);
  console.log('sandbox stopped.');
}
