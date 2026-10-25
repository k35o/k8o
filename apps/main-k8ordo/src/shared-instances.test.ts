import { globSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

type Manifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const packageDir = resolve(import.meta.dirname, '..');
const mainDir = resolve(packageDir, '../main');
const workspaceRoot = resolve(packageDir, '../..');

const manifest = JSON.parse(
  readFileSync(join(packageDir, 'package.json'), 'utf8'),
) as Manifest;
const ownDependencies = new Set(
  Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }),
);

// 写さずに読む記事とデモ。テストと story は apps/main だけが読む
const sharedFiles = globSync(
  ['src/content/**/*.{ts,tsx}', 'src/playgrounds/**/*.{ts,tsx}'],
  {
    cwd: mainDir,
    exclude: (path) => /\.(?:test|stories)\.tsx?$/u.test(path),
  },
);

const IMPORT_SOURCE =
  /^\s*(?:import\s*|(?:import|export)\b[^'"]*?\bfrom\s*)['"]([^'"]+)['"]/gmu;

const packageNameOf = (source: string): string =>
  source
    .split('/')
    .slice(0, source.startsWith('@') ? 2 : 1)
    .join('/');

const importedPackages = [
  ...new Set(
    sharedFiles.flatMap((file) =>
      [...readFileSync(join(mainDir, file), 'utf8').matchAll(IMPORT_SOURCE)]
        .map(([, source = '']) => source)
        .filter((source) => !source.startsWith('.') && !source.includes(':'))
        .map(packageNameOf),
    ),
  ),
].toSorted();

// 記事とデモは apps/main の node_modules から依存を引く。こちらが使わない依存は実体が1つなので比べない
const sharedDependencies = importedPackages.filter((name) =>
  ownDependencies.has(name),
);

const instanceOf = (dir: string, name: string): string =>
  relative(workspaceRoot, realpathSync(join(dir, 'node_modules', name)));

describe('記事とデモが読む依存の実体', () => {
  describe('正常系', () => {
    it('記事とデモが読む依存のうち、Provider を持つものをこちらも使う', () => {
      expect(sharedDependencies).toStrictEqual(
        expect.arrayContaining(['@k8ordo/ui', 'react']),
      );
    });

    it.each(sharedDependencies)(
      '%s を apps/main と同じ実体に解決する',
      (name) => {
        expect(
          instanceOf(packageDir, name),
          'ずれた依存を `pnpm update -r <依存名>` で再解決する',
        ).toBe(instanceOf(mainDir, name));
      },
    );
  });
});
