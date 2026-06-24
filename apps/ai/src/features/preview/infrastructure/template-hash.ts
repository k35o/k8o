import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// snapshot を焼く元（sandbox-template）の bake 対象に含めるべきでないもの。
// bake-sandbox-snapshot.mjs の収集ロジックと揃える。
const SKIP_DIRS = new Set(['node_modules', 'dist', '.vite', '.git']);

const collect = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  const subdirs: string[] = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        subdirs.push(abs);
      }
    } else if (entry.isFile()) {
      files.push(abs);
    }
  }
  const nested = await Promise.all(subdirs.map((sub) => collect(sub)));
  return [...files, ...nested.flat()];
};

// sandbox-template の内容指紋（相対パス＋内容を決定的に並べた SHA256）。
// テンプレが変われば必ず変わるので、「snapshot の焼き直しが要るか」の判定に使う。
// bake 時にこの値を template-snapshot.ts に記録し、テストで現状と一致するか検証する。
export const computeTemplateHash = async (
  templateDir: string,
): Promise<string> => {
  const absFiles = await collect(templateDir);
  const entries = await Promise.all(
    absFiles.map(async (abs) => ({
      rel: path.relative(templateDir, abs).split(path.sep).join('/'),
      content: await readFile(abs),
    })),
  );
  entries.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));

  const hash = createHash('sha256');
  for (const { rel, content } of entries) {
    hash.update(rel);
    hash.update('\0');
    hash.update(content);
    hash.update('\0');
  }
  return hash.digest('hex');
};
