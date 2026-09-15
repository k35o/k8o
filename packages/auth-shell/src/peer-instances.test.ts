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
