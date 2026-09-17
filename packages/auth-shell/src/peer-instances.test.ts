import { globSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

type Manifest = {
  name: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const packageDir = resolve(import.meta.dirname, '..');
const workspaceRoot = resolve(packageDir, '../..');

const readManifest = (dir: string): Manifest =>
  JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Manifest;

const authShell = readManifest(packageDir);

const consumerDirs = globSync(
  ['apps/*/package.json', 'packages/*/package.json'],
  { cwd: workspaceRoot },
)
  .map((manifestPath) => join(workspaceRoot, dirname(manifestPath)))
  .filter((dir) => authShell.name in (readManifest(dir).dependencies ?? {}));

const packageNamesIn = (nodeModulesDir: string): string[] =>
  readdirSync(nodeModulesDir)
    .filter((entry) => !entry.startsWith('.'))
    .flatMap((entry) =>
      entry.startsWith('@')
        ? readdirSync(join(nodeModulesDir, entry)).map(
            (scoped) => `${entry}/${scoped}`,
          )
        : [entry],
    );

// 実体の比較だけなら realpath 1つで足りるが、pnpm の仮想ストアでは同じ階層に
// その実体の依存と peer が並ぶので、それごと比べて落ちたときの diff にずれた依存を出す
const linkedDependencies = (
  dir: string,
  name: string,
): Record<string, string> => {
  const instanceDir = realpathSync(join(dir, 'node_modules', name));
  const nodeModulesDir = resolve(
    instanceDir,
    ...name.split('/').map(() => '..'),
  );
  return Object.fromEntries(
    packageNamesIn(nodeModulesDir).map((dependency) => [
      dependency,
      relative(workspaceRoot, realpathSync(join(nodeModulesDir, dependency))),
    ]),
  );
};

const cases = consumerDirs.flatMap((consumerDir) =>
  Object.keys(authShell.peerDependencies ?? {}).map((peer) => ({
    consumer: relative(workspaceRoot, consumerDir),
    consumerDir,
    peer,
  })),
);

describe('peerDependencies の実体', () => {
  describe('正常系', () => {
    it('auth-shell を使うパッケージがある', () => {
      expect(consumerDirs).not.toHaveLength(0);
    });

    it.each(cases)(
      '$consumer は $peer を auth-shell と同じ実体に解決する',
      ({ consumerDir, peer }) => {
        expect(
          linkedDependencies(consumerDir, peer),
          'ずれた依存を `pnpm update -r <依存名>` で再解決する',
        ).toStrictEqual(linkedDependencies(packageDir, peer));
      },
    );
  });
});

// snapshots のキーの行だけ読めば足りるので、YAML パーサーは足さない
const snapshotKeys = readFileSync(join(workspaceRoot, 'pnpm-lock.yaml'), 'utf8')
  .split(/^(?=\S)/mu)
  .filter((section) => section.startsWith('snapshots:'))
  .flatMap((section) => section.match(/^ {2}\S+(?=:)/gmu) ?? [])
  .map((line) => line.trim().replaceAll("'", ''));

describe('lockfile の React と Next', () => {
  describe('正常系', () => {
    it.each(['react', 'react-dom', 'next', '@types/react', '@types/react-dom'])(
      '%s の版と peer の組み合わせが1つに揃っている',
      (name) => {
        // toHaveLength だと失敗時に長いキーが省略されるので、diff で残ったキーを出す。
        // vitest は同じメッセージの失敗を1つにまとめて表示するため、依存名を入れて分ける
        expect(
          snapshotKeys.filter((key) => key.startsWith(`${name}@`)),
          `${name} を含む落ちた依存をまとめて \`pnpm update -r <依存名...>\` で再解決する`,
        ).toStrictEqual([expect.any(String)]);
      },
    );
  });
});
