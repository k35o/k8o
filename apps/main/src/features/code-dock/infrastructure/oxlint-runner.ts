import 'server-only';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

// code / url / help は診断によってはフィールドごと欠ける
// (例: reportUnusedDisableDirectives の「Unused disable directive」)
export type OxlintRawDiagnostic = {
  message?: string;
  code?: string;
  severity?: string;
  url?: string;
  help?: string;
  labels?: Array<{ span?: { line?: number; column?: number } }>;
};

export type OxlintRawOutput = {
  diagnostics: OxlintRawDiagnostic[];
};

// oxlint の bin は exports マップに無く、Turbopack は require.resolve を
// 静的解決して仮想モジュールIDへ書き換えてしまうため、require には頼らず
// cwd から node_modules を上方向に探してパスを解決する
const findOxlintBin = (dir: string): string => {
  const candidate = join(dir, 'node_modules', 'oxlint', 'bin', 'oxlint');
  if (existsSync(candidate)) {
    return candidate;
  }
  const parent = dirname(dir);
  if (parent === dir) {
    throw new Error('oxlint の実行ファイルが見つかりませんでした');
  }
  return findOxlintBin(parent);
};

const OXLINT_BIN = findOxlintBin(process.cwd());

const EXEC_TIMEOUT_MS = 10_000;
const MAX_STDOUT_BYTES = 10 * 1024 * 1024;

const execOxlint = (
  configPath: string,
  inputPath: string,
  cwd: string,
): Promise<string> =>
  new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [
        OXLINT_BIN,
        '-c',
        configPath,
        '-f',
        'json',
        '--no-ignore',
        '--disable-nested-config',
        inputPath,
      ],
      { cwd, maxBuffer: MAX_STDOUT_BYTES, timeout: EXEC_TIMEOUT_MS },
      (error, stdout) => {
        if (error === null) {
          resolve(stdout);
          return;
        }
        // 診断が 1 件でもあると exit code 1 になるため、stdout があれば正常系として扱う
        if (error.code === 1 && stdout !== '') {
          resolve(stdout);
          return;
        }
        reject(
          error instanceof Error ? error : new Error('oxlint の実行に失敗'),
        );
      },
    );
  });

const parseOutput = (stdout: string): OxlintRawOutput => {
  if (!stdout.trimStart().startsWith('{')) {
    throw new Error(
      `oxlint の出力を解釈できませんでした: ${stdout.slice(0, 500)}`,
    );
  }
  const parsed: unknown = JSON.parse(stdout);
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    Array.isArray((parsed as { diagnostics?: unknown }).diagnostics)
  ) {
    return parsed as OxlintRawOutput;
  }
  throw new Error('oxlint の出力を解釈できませんでした');
};

export const runOxlint = async (
  code: string,
  fileName: string,
  oxlintrcJson: string,
): Promise<OxlintRawOutput> => {
  // リクエストごとに専用ディレクトリを作るため、同時実行しても衝突しない
  const tempDir = await mkdtemp(join(tmpdir(), 'code-dock-'));
  try {
    const configPath = join(tempDir, '.oxlintrc.json');
    const inputPath = join(tempDir, fileName);
    await Promise.all([
      writeFile(configPath, oxlintrcJson, 'utf8'),
      writeFile(inputPath, code, 'utf8'),
    ]);
    const stdout = await execOxlint(configPath, inputPath, tempDir);
    return parseOutput(stdout);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
};
