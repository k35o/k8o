// sandbox-template を Vercel Sandbox に焼いて snapshot を作る（テンプレ・arte-odyssey 更新時に再実行）。
// snapshot ID と内容ハッシュは template-snapshot.ts に書き出してコミット管理する
// （env の手編集は不要。テンプレ変更時の焼き忘れは template-snapshot.test.ts が検知）。
// 認証は VERCEL_TOKEN（fnox exec で注入）＋ team/project ID 明示渡し。
// 使い方: fnox exec -- node apps/ai/scripts/bake-sandbox-snapshot.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Sandbox } from '@vercel/sandbox';

import { computeTemplateHash } from '../src/features/preview/infrastructure/template-hash.ts';

const TEAM_ID = 'team_K1poAqb11IhJpOHw17Z5qhvC';
const PROJECT_ID = 'prj_Iz1SHi1C6rgwFz2YngTzeiRdsFE8';
const WORKDIR = '/vercel/sandbox';
const SKIP_DIRS = new Set(['node_modules', 'dist', '.vite', '.git']);

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error('VERCEL_TOKEN が未設定です（fnox exec -- で渡してください）');
  process.exit(1);
}

const here = import.meta.dirname;
const templateDir = path.resolve(here, '..', 'sandbox-template');
const pointerPath = path.resolve(
  here,
  '..',
  'src/features/preview/infrastructure/template-snapshot.ts',
);

const collect = async (dir) => {
  const ents = await readdir(dir, { withFileTypes: true });
  const lists = await Promise.all(
    ents.map(async (e) => {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) {
        return SKIP_DIRS.has(e.name) ? [] : collect(abs);
      }
      return e.isFile() ? [abs] : [];
    }),
  );
  return lists.flat();
};

const absFiles = await collect(templateDir);
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
  token,
  teamId: TEAM_ID,
  projectId: PROJECT_ID,
  runtime: 'node24',
  timeout: 10 * 60 * 1000,
});
try {
  await sandbox.writeFiles(files);
  console.log('files written. running `npm ci`...');
  const ci = await sandbox.runCommand({
    cmd: 'npm',
    args: ['ci'],
    cwd: WORKDIR,
    timeoutMs: 8 * 60 * 1000,
  });
  console.log(`npm ci exit=${ci.exitCode}`);
  if (ci.exitCode !== 0) {
    console.error((await ci.stderr()).slice(-3000));
    throw new Error('npm ci failed');
  }
  console.log('snapshotting...');
  const snap = await sandbox.snapshot({ expiration: 0 });
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
