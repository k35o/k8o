import { asSchema } from 'ai';
import type { FlexibleSchema } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchGithubContent,
  fetchGithubIssue,
  fetchGithubIssueComments,
  fetchGithubPull,
  fetchGithubPullFiles,
  fetchGithubRepos,
  searchGithubCode,
  searchGithubIssues,
} from '../infrastructure/github-api';
import type * as githubApiModule from '../infrastructure/github-api';
import type {
  GithubComment,
  GithubIssue,
  GithubPull,
  GithubPullFile,
  GithubRepo,
} from '../infrastructure/github-api';
import { githubTools } from './github-tools';

vi.mock('server-only', () => ({}));
vi.mock('../infrastructure/github-api', async (importOriginal) => ({
  ...(await importOriginal<typeof githubApiModule>()),
  fetchGithubContent: vi.fn(),
  fetchGithubIssue: vi.fn(),
  fetchGithubIssueComments: vi.fn(),
  fetchGithubPull: vi.fn(),
  fetchGithubPullFiles: vi.fn(),
  fetchGithubRepos: vi.fn(),
  searchGithubCode: vi.fn(),
  searchGithubIssues: vi.fn(),
}));

type Tools = typeof githubTools;

const options = (
  abortSignal?: AbortSignal,
): Parameters<Tools['list_github_repos']['execute']>[1] => ({
  toolCallId: 'call-1',
  messages: [],
  context: {},
  ...(abortSignal === undefined ? {} : { abortSignal }),
});

const listRepos = (
  input: Parameters<Tools['list_github_repos']['execute']>[0],
  abortSignal?: AbortSignal,
): Promise<unknown> =>
  Promise.resolve(
    githubTools.list_github_repos.execute(input, options(abortSignal)),
  );

const readFile = (
  input: Parameters<Tools['read_github_file']['execute']>[0],
  abortSignal?: AbortSignal,
): Promise<unknown> =>
  Promise.resolve(
    githubTools.read_github_file.execute(input, options(abortSignal)),
  );

const searchCode = (
  input: Parameters<Tools['search_github_code']['execute']>[0],
  abortSignal?: AbortSignal,
): Promise<unknown> =>
  Promise.resolve(
    githubTools.search_github_code.execute(input, options(abortSignal)),
  );

const searchIssues = (
  input: Parameters<Tools['search_github_issues']['execute']>[0],
  abortSignal?: AbortSignal,
): Promise<unknown> =>
  Promise.resolve(
    githubTools.search_github_issues.execute(input, options(abortSignal)),
  );

const readIssue = (
  input: Parameters<Tools['read_github_issue']['execute']>[0],
  abortSignal?: AbortSignal,
): Promise<unknown> =>
  Promise.resolve(
    githubTools.read_github_issue.execute(input, options(abortSignal)),
  );

// モデルが出した tool の入力は、execute の前に SDK が inputSchema で検証する
const accepts = async (
  schema: FlexibleSchema<unknown>,
  input: unknown,
): Promise<boolean> => {
  const result = await asSchema(schema).validate?.(input);
  return result?.success === true;
};

const jsonSchemaOf = (
  schema: FlexibleSchema<unknown>,
): ReturnType<typeof asSchema>['jsonSchema'] => asSchema(schema).jsonSchema;

const repo = (overrides: Partial<GithubRepo> = {}): GithubRepo => ({
  name: 'k8o',
  isPrivate: false,
  isFork: false,
  isArchived: false,
  defaultBranch: 'main',
  pushedAt: '2026-10-20T09:00:00Z',
  description: '個人のポートフォリオ',
  ...overrides,
});

const issue = (overrides: Partial<GithubIssue> = {}): GithubIssue => ({
  number: 12,
  title: '一覧が空になる',
  isPullRequest: false,
  state: 'open',
  author: 'someone',
  authorAssociation: 'NONE',
  comments: 0,
  createdAt: '2026-10-19T00:00:00Z',
  updatedAt: '2026-10-20T00:00:00Z',
  labels: [],
  body: '再読み込みすると一覧が空になります',
  ...overrides,
});

const comment = (overrides: Partial<GithubComment> = {}): GithubComment => ({
  author: 'k35o',
  authorAssociation: 'OWNER',
  createdAt: '2026-10-20T00:00:00Z',
  body: '直しました',
  ...overrides,
});

const pull = (overrides: Partial<GithubPull> = {}): GithubPull => ({
  headOwner: 'k35o',
  headRef: 'feat/ai-remove-studio',
  headSha: '0123456789abcdef0123456789abcdef01234567',
  baseRef: 'main',
  isDraft: false,
  commits: 3,
  additions: 120,
  deletions: 340,
  changedFiles: 2,
  ...overrides,
});

const pullFile = (overrides: Partial<GithubPullFile> = {}): GithubPullFile => ({
  status: 'modified',
  path: 'apps/ai/src/proxy.ts',
  previousPath: undefined,
  additions: 12,
  deletions: 3,
  ...overrides,
});

const fileContent = (text: string): void => {
  vi.mocked(fetchGithubContent).mockResolvedValue({
    type: 'file',
    size: Buffer.byteLength(text),
    text,
  });
};

beforeEach(() => {
  vi.mocked(fetchGithubIssueComments).mockResolvedValue({
    items: [],
    hasNext: false,
  });
});

describe('githubTools', () => {
  describe('正常系', () => {
    // 最初のデプロイで既存のスレッドに残り、そのあと1字でもずれると送り返す thinking が落とされる
    it('Claude に送る description と入力の JSON Schema を固定する', async () => {
      const definitions = Object.fromEntries(
        await Promise.all(
          Object.entries(githubTools).map(async ([name, definition]) => [
            name,
            {
              description: definition.description,
              inputSchema: await jsonSchemaOf(definition.inputSchema),
            },
          ]),
        ),
      );

      const repoSchema = {
        type: 'string',
        pattern: '^[A-Za-z0-9._-]{1,100}$',
        description: 'リポジトリの名前。k35o/ は付けない（例: k8o）',
      };
      const positiveInt = (description: string): unknown => ({
        type: 'integer',
        exclusiveMinimum: 0,
        maximum: 9_007_199_254_740_991,
        description,
      });
      const page = positiveInt(
        'ページの番号（1 から）。結果に次のページがあると書かれていたら、その番号を渡す',
      );
      const objectSchema = (
        properties: Record<string, unknown>,
      ): Record<string, unknown> => ({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties,
        additionalProperties: false,
      });
      expect(definitions).toStrictEqual({
        list_github_repos: {
          description:
            'k8o の GitHub のアカウント（k35o）のリポジトリの一覧（名前・公開か非公開か・フォークか・既定の枝・最後に push した日時・説明）を、push の新しい順に返す',
          inputSchema: objectSchema({ page }),
        },
        read_github_file: {
          description:
            'k35o のリポジトリのファイルを行番号つきで読むか、ディレクトリの中身を一覧する。長いファイルは startLine・endLine で範囲を指して読む',
          inputSchema: {
            ...objectSchema({
              repo: repoSchema,
              path: {
                type: 'string',
                maxLength: 1024,
                description:
                  'リポジトリのルートからのパス（例: apps/ai/src/proxy.ts）。省くとルートのディレクトリ',
              },
              ref: {
                type: 'string',
                minLength: 1,
                maxLength: 255,
                description:
                  '枝・タグ・コミットの SHA。省くと既定の枝。PR の変更後のファイルは、read_github_issue が返す head の SHA を渡す',
              },
              startLine: positiveInt('読み始める行（1 から）'),
              endLine: positiveInt('読み終える行（その行を含む）'),
            }),
            required: ['repo'],
          },
        },
        search_github_code: {
          description:
            'k35o のリポジトリの既定の枝のコードを検索し、当たったファイルのパスと、当たった箇所の断片を返す。ファイルの全体は read_github_file で読む',
          inputSchema: {
            ...objectSchema({
              query: {
                type: 'string',
                minLength: 1,
                maxLength: 256,
                description:
                  '検索語。GitHub のコード検索の修飾子（language:・path:・extension: など）も書ける。リポジトリは repo で絞り、user:・org:・repo: は書かない',
              },
              repo: repoSchema,
              page,
            }),
            required: ['query'],
          },
        },
        search_github_issues: {
          description:
            'k35o のリポジトリの issue と PR を検索し、番号・種類・状態・タイトル・書いた人・コメントの数を、更新の新しい順に返す。中身は read_github_issue で読む',
          inputSchema: objectSchema({
            query: {
              type: 'string',
              minLength: 1,
              maxLength: 256,
              description:
                '検索語と修飾子（is:pr・is:issue・is:open・author:・label: など）。省くとすべて。リポジトリは repo で絞り、user:・org:・repo: は書かない',
            },
            repo: repoSchema,
            page,
          }),
        },
        read_github_issue: {
          description:
            'k35o のリポジトリの issue か PR を、本文とコメントごと読む。PR なら、枝・head の SHA・マージの状態と、変更したファイルの一覧（差分は含まない）も返す。変更後のファイルは、その SHA を ref に渡して read_github_file で読む。PR のレビューとコードへのコメントは含まない',
          inputSchema: {
            ...objectSchema({
              repo: repoSchema,
              number: positiveInt('issue か PR の番号'),
              page: positiveInt(
                'コメントのページの番号（1 から）。結果に次のページがあると書かれていたら、その番号を渡す',
              ),
            }),
            required: ['repo', 'number'],
          },
        },
      });
    });

    it.each(['k8o', 'k8o.github.io', '.github', 'some_lib-2'])(
      'repo の名前 %j を受ける',
      async (name) => {
        await expect(
          accepts(githubTools.read_github_file.inputSchema, { repo: name }),
        ).resolves.toBe(true);
      },
    );
  });

  describe('異常系', () => {
    it.each(['k35o/k8o', '', 'a b', '../user', 'a'.repeat(101)])(
      'repo が %j なら、tool の入力として受けない',
      async (name) => {
        await expect(
          accepts(githubTools.read_github_issue.inputSchema, {
            repo: name,
            number: 1,
          }),
        ).resolves.toBe(false);
      },
    );

    it.each([
      ['0 のページ', 'list_github_repos', { page: 0 }],
      ['小数のページ', 'search_github_issues', { page: 1.5 }],
      ['0 の番号', 'read_github_issue', { repo: 'k8o', number: 0 }],
      ['小数の番号', 'read_github_issue', { repo: 'k8o', number: 2.5 }],
      ['0 の行', 'read_github_file', { repo: 'k8o', startLine: 0 }],
      ['負の行', 'read_github_file', { repo: 'k8o', endLine: -1 }],
      ['空の ref', 'read_github_file', { repo: 'k8o', ref: '' }],
      ['空の検索語', 'search_github_code', { query: '' }],
      ['257 字の検索語', 'search_github_code', { query: 'a'.repeat(257) }],
    ] as const)('%s は受けない', async (_label, name, input) => {
      await expect(accepts(githubTools[name].inputSchema, input)).resolves.toBe(
        false,
      );
    });

    it('API の例外は、そのまま tool のエラーにする', async () => {
      vi.mocked(fetchGithubContent).mockRejectedValue(
        new Error(
          '見つかりません。名前・パス・番号が違うか、読む権限がありません',
        ),
      );

      await expect(readFile({ repo: 'k8o', path: 'missing' })).rejects.toThrow(
        '見つかりません。名前・パス・番号が違うか、読む権限がありません',
      );
    });
  });
});

describe('list_github_repos', () => {
  describe('正常系', () => {
    it('リポジトリを1件1行で、公開か・フォークか・既定の枝・push の日時・説明と、次のページを出す', async () => {
      vi.mocked(fetchGithubRepos).mockResolvedValue({
        items: [
          repo(),
          repo({
            name: 'some-lib',
            isFork: true,
            isArchived: true,
            pushedAt: null,
            description: null,
          }),
        ],
        hasNext: true,
      });

      await expect(listRepos({})).resolves.toBe(
        [
          'k35o のリポジトリ（push の新しい順・1 ページ目・2 件）',
          '- k8o（public・既定の枝 main・push 2026-10-20T09:00:00Z）: 個人のポートフォリオ',
          '- some-lib（public・fork・既定の枝 main・archived）',
          '次のページがあります（page: 2）',
        ].join('\n'),
      );
    });

    it('ページの番号と中断のシグナルを API の呼び出しに渡す', async () => {
      vi.mocked(fetchGithubRepos).mockResolvedValue({
        items: [],
        hasNext: false,
      });
      const controller = new AbortController();

      await expect(listRepos({ page: 3 }, controller.signal)).resolves.toBe(
        'k35o のリポジトリ（push の新しい順・3 ページ目・0 件）',
      );
      expect(fetchGithubRepos).toHaveBeenCalledExactlyOnceWith(
        3,
        controller.signal,
      );
    });
  });

  describe('エッジケース', () => {
    it('200 字を超える説明は、サロゲートペアを割らずに 200 字で切る', async () => {
      vi.mocked(fetchGithubRepos).mockResolvedValue({
        items: [repo({ description: '🍣'.repeat(201) })],
        hasNext: false,
      });

      await expect(listRepos({})).resolves.toBe(
        [
          'k35o のリポジトリ（push の新しい順・1 ページ目・1 件）',
          `- k8o（public・既定の枝 main・push 2026-10-20T09:00:00Z）: ${'🍣'.repeat(200)}…`,
        ].join('\n'),
      );
    });
  });
});

describe('read_github_file', () => {
  describe('正常系', () => {
    it('ファイルを、行番号とタブを付けて出す', async () => {
      fileContent('import "server-only";\n\nexport const a = 1;\n');

      await expect(
        readFile({ repo: 'k8o', path: 'apps/ai/src/a.ts' }),
      ).resolves.toBe(
        [
          'k35o/k8o の apps/ai/src/a.ts（ref: 既定の枝・全 3 行・1〜3 行目）',
          '1\timport "server-only";',
          '2\t',
          '3\texport const a = 1;',
        ].join('\n'),
      );
    });

    it('startLine・endLine の範囲だけを出し、ref と中断のシグナルを API の呼び出しに渡す', async () => {
      fileContent('a\nb\nc\nd');
      const controller = new AbortController();

      await expect(
        readFile(
          {
            repo: 'k8o',
            path: 'x.txt',
            ref: '0123456789abcdef0123456789abcdef01234567',
            startLine: 2,
            endLine: 3,
          },
          controller.signal,
        ),
      ).resolves.toBe(
        [
          'k35o/k8o の x.txt（ref: 0123456789abcdef0123456789abcdef01234567・全 4 行・2〜3 行目）',
          '2\tb',
          '3\tc',
        ].join('\n'),
      );
      expect(fetchGithubContent).toHaveBeenCalledExactlyOnceWith(
        {
          repo: 'k8o',
          path: 'x.txt',
          ref: '0123456789abcdef0123456789abcdef01234567',
        },
        controller.signal,
      );
    });

    it('ディレクトリは、種類と名前と、ファイルの大きさを1件1行で出す', async () => {
      vi.mocked(fetchGithubContent).mockResolvedValue({
        type: 'dir',
        entries: [
          { type: 'dir', name: 'app', size: 0 },
          { type: 'file', name: 'proxy.ts', size: 1234 },
          { type: 'symlink', name: 'link-name', size: 10 },
          { type: 'submodule', name: 'vendor-lib', size: 0 },
        ],
      });

      await expect(
        readFile({ repo: 'k8o', path: 'apps/ai/src' }),
      ).resolves.toBe(
        [
          'k35o/k8o の apps/ai/src（ref: 既定の枝・ディレクトリ・4 件）',
          'dir\tapp',
          'file\tproxy.ts\t1,234 バイト',
          'symlink\tlink-name',
          'submodule\tvendor-lib',
        ].join('\n'),
      );
    });

    it('path を省くと、ルートのディレクトリを読む', async () => {
      vi.mocked(fetchGithubContent).mockResolvedValue({
        type: 'dir',
        entries: [],
      });

      await expect(readFile({ repo: 'k8o' })).resolves.toBe(
        'k35o/k8o のルート（ref: 既定の枝・ディレクトリ・0 件）',
      );
      expect(fetchGithubContent).toHaveBeenCalledExactlyOnceWith(
        { repo: 'k8o', path: '', ref: undefined },
        undefined,
      );
    });

    it.each([
      ['binary', 'バイナリのファイルなので中身を出しません（12,345 バイト）'],
      ['too-large', '1 MB を超えるファイルなので読めません（12,345 バイト）'],
    ] as const)('%s のファイルは中身を出さない', async (type, message) => {
      vi.mocked(fetchGithubContent).mockResolvedValue({ type, size: 12_345 });

      await expect(readFile({ repo: 'k8o', path: 'a.bin' })).resolves.toBe(
        `k35o/k8o の a.bin（ref: 既定の枝）\n${message}`,
      );
    });
  });

  describe('異常系', () => {
    it('endLine が startLine より小さければ、エラーにする', async () => {
      fileContent('a\nb\nc');

      await expect(
        readFile({ repo: 'k8o', path: 'a', startLine: 3, endLine: 2 }),
      ).rejects.toThrow('endLine が startLine より小さいです');
    });

    it('startLine が行数を超えれば、エラーにする', async () => {
      fileContent('a\nb\nc\n');

      await expect(
        readFile({ repo: 'k8o', path: 'a', startLine: 4 }),
      ).rejects.toThrow('startLine が行数（3 行）を超えています');
    });
  });

  describe('エッジケース', () => {
    it('見出しと行番号を含めて 50,000 字に収まらない行は出さず、続きの startLine を書く', async () => {
      // 見出しは 40 字なので、見出しと 1 行目でちょうど 50,000 字になり、2 行目は収まらない
      fileContent(`${'あ'.repeat(49_957)}\nb`);

      await expect(readFile({ repo: 'k8o', path: 'a.txt' })).resolves.toBe(
        [
          'k35o/k8o の a.txt（ref: 既定の枝・全 2 行・1〜1 行目）',
          `1\t${'あ'.repeat(49_957)}`,
          '（1 行目までを出しました。続きは startLine: 2 で読んでください）',
        ].join('\n'),
      );
    });

    it('ちょうど 50,000 字に収まるファイルは切らない', async () => {
      fileContent('あ'.repeat(49_957));

      await expect(readFile({ repo: 'k8o', path: 'a.txt' })).resolves.toBe(
        [
          'k35o/k8o の a.txt（ref: 既定の枝・全 1 行・1〜1 行目）',
          `1\t${'あ'.repeat(49_957)}`,
        ].join('\n'),
      );
    });

    it('1 行だけで 50,000 字を超えるときは、その行をサロゲートペアを割らずに字で切る', async () => {
      fileContent(`${'🍣'.repeat(49_958)}\nb`);

      await expect(readFile({ repo: 'k8o', path: 'a.txt' })).resolves.toBe(
        [
          'k35o/k8o の a.txt（ref: 既定の枝・全 2 行・1〜1 行目）',
          `1\t${'🍣'.repeat(49_957)}`,
          '（1 行目が長いので途中で切りました。続きの行は startLine: 2 で読んでください）',
        ].join('\n'),
      );
    });

    it('最後の行だけで 50,000 字を超えるときは、続きの startLine を書かない', async () => {
      fileContent(`a\n${'あ'.repeat(60_000)}`);

      const output = await readFile({
        repo: 'k8o',
        path: 'a.txt',
        startLine: 2,
      });

      expect(output).toMatch(
        /^k35o\/k8o の a\.txt（ref: 既定の枝・全 2 行・2〜2 行目）\n2\tあ+\n（2 行目が長いので途中で切りました）$/u,
      );
    });

    it('endLine が行数を超えれば、最後の行までを出す', async () => {
      fileContent('a\nb');

      await expect(
        readFile({ repo: 'k8o', path: 'a', startLine: 2, endLine: 10 }),
      ).resolves.toBe(
        ['k35o/k8o の a（ref: 既定の枝・全 2 行・2〜2 行目）', '2\tb'].join(
          '\n',
        ),
      );
    });

    it('改行が CRLF のファイルも、行ごとに分ける', async () => {
      fileContent('a\r\nb\r\n');

      await expect(readFile({ repo: 'k8o', path: 'a' })).resolves.toBe(
        [
          'k35o/k8o の a（ref: 既定の枝・全 2 行・1〜2 行目）',
          '1\ta',
          '2\tb',
        ].join('\n'),
      );
    });

    it('空のファイルは、空であることを書く', async () => {
      fileContent('');

      await expect(readFile({ repo: 'k8o', path: 'a' })).resolves.toBe(
        'k35o/k8o の a（ref: 既定の枝・全 0 行）\n（空のファイルです）',
      );
    });

    it('50,000 字に収まらないディレクトリは、収まる件数まで出して全体の件数を書く', async () => {
      vi.mocked(fetchGithubContent).mockResolvedValue({
        type: 'dir',
        entries: Array.from({ length: 1000 }, (_, index) => ({
          type: 'dir',
          name: `${index.toString().padStart(4, '0')}${'x'.repeat(96)}`,
          size: 0,
        })),
      });

      const output = String(await readFile({ repo: 'k8o', path: 'big' }));

      // 見出しは 39 字、1 件は改行を含めて 105 字なので、475 件で 49,914 字になる
      const lines = output.split('\n');
      expect(lines).toHaveLength(477);
      expect(lines[0]).toBe(
        'k35o/k8o の big（ref: 既定の枝・ディレクトリ・1000 件）',
      );
      expect(lines[475]).toBe(`dir\t0474${'x'.repeat(96)}`);
      expect(lines[476]).toBe('（475 件まで出しました。全 1000 件）');
    });

    it('path の先頭と末尾の / を取り除く', async () => {
      fileContent('a');

      await readFile({ repo: 'k8o', path: '/apps/ai/' });

      expect(fetchGithubContent).toHaveBeenCalledExactlyOnceWith(
        { repo: 'k8o', path: 'apps/ai', ref: undefined },
        undefined,
      );
    });

    it('symlink や submodule のパスを直接指したときは、種類だけを書く', async () => {
      vi.mocked(fetchGithubContent).mockResolvedValue({ type: 'submodule' });

      await expect(readFile({ repo: 'k8o', path: 'vendor-lib' })).resolves.toBe(
        'k35o/k8o の vendor-lib（ref: 既定の枝・submodule）\nファイルでもディレクトリでもないので、中身を出しません',
      );
    });
  });
});

describe('search_github_code', () => {
  describe('正常系', () => {
    it('当たったファイルのパスと断片を出し、欠けと省いた件数と次のページを書く', async () => {
      vi.mocked(searchGithubCode).mockResolvedValue({
        totalCount: 7,
        incompleteResults: true,
        omitted: 3,
        items: [
          {
            repo: 'k8o',
            path: 'apps/ai/src/features/agent/interface/chat.ts',
            fragments: ['const reservation = await reserveUsage({'],
          },
        ],
        hasNext: true,
      });
      const controller = new AbortController();

      await expect(
        searchCode({ query: 'reserveUsage' }, controller.signal),
      ).resolves.toBe(
        [
          '「reserveUsage」のコードの検索結果（k35o・全 7 件・1 ページ目）',
          '## k8o: apps/ai/src/features/agent/interface/chat.ts',
          '…const reservation = await reserveUsage({…',
          '（GitHub の検索が時間内に終わらず、結果が欠けているかもしれません）',
          'k35o の外の 3 件は出していません',
          '次のページがあります（page: 2）',
        ].join('\n'),
      );
      expect(searchGithubCode).toHaveBeenCalledExactlyOnceWith(
        { query: 'reserveUsage', repo: undefined, page: 1 },
        controller.signal,
      );
    });

    it('当たりが無ければ、そう書く', async () => {
      vi.mocked(searchGithubCode).mockResolvedValue({
        totalCount: 0,
        incompleteResults: false,
        omitted: 0,
        items: [],
        hasNext: false,
      });

      await expect(
        searchCode({ query: 'missing', repo: 'k8o', page: 2 }),
      ).resolves.toBe(
        [
          '「missing」のコードの検索結果（k35o/k8o・全 0 件・2 ページ目）',
          '（当たりはありません）',
        ].join('\n'),
      );
    });
  });

  describe('エッジケース', () => {
    it('断片は1件につき 3 つまで、1 つ 600 字までにする', async () => {
      vi.mocked(searchGithubCode).mockResolvedValue({
        totalCount: 1,
        incompleteResults: false,
        omitted: 0,
        items: [
          {
            repo: 'k8o',
            path: 'a.ts',
            fragments: ['🍣'.repeat(601), 'b', 'c', 'd'],
          },
        ],
        hasNext: false,
      });

      await expect(searchCode({ query: 'x' })).resolves.toBe(
        [
          '「x」のコードの検索結果（k35o・全 1 件・1 ページ目）',
          '## k8o: a.ts',
          `…${'🍣'.repeat(600)}…`,
          '…b…',
          '…c…',
        ].join('\n'),
      );
    });
  });
});

describe('search_github_issues', () => {
  describe('正常系', () => {
    it('issue と PR を1件1行で、種類・状態・書いた人・コメントの数・更新の日時と出す', async () => {
      vi.mocked(searchGithubIssues).mockResolvedValue({
        totalCount: 45,
        incompleteResults: false,
        omitted: 0,
        items: [
          {
            repo: 'k8o',
            number: 2212,
            title: 'feat(ai): 生成物のページ',
            isPullRequest: true,
            state: 'merged',
            author: 'k35o',
            authorAssociation: 'OWNER',
            comments: 3,
            updatedAt: '2026-10-20T09:00:00Z',
          },
          {
            repo: 'k8o',
            number: 12,
            title: '🍣'.repeat(201),
            isPullRequest: false,
            state: 'open',
            author: 'someone',
            authorAssociation: 'NONE',
            comments: 0,
            updatedAt: '2026-10-19T09:00:00Z',
          },
        ],
        hasNext: true,
      });

      await expect(
        searchIssues({ query: 'is:open', repo: 'k8o' }),
      ).resolves.toBe(
        [
          'k35o/k8o の issue と PR（「is:open」・更新の新しい順・全 45 件・1 ページ目）',
          '- k8o#2212 [PR・merged] feat(ai): 生成物のページ（@k35o・OWNER・コメント 3・更新 2026-10-20T09:00:00Z）',
          `- k8o#12 [issue・open] ${'🍣'.repeat(200)}…（@someone・NONE・コメント 0・更新 2026-10-19T09:00:00Z）`,
          '次のページがあります（page: 2）',
        ].join('\n'),
      );
    });

    it('検索語を省くと、すべての issue と PR を頼み、中断のシグナルを渡す', async () => {
      vi.mocked(searchGithubIssues).mockResolvedValue({
        totalCount: 0,
        incompleteResults: false,
        omitted: 1,
        items: [],
        hasNext: false,
      });
      const controller = new AbortController();

      await expect(searchIssues({}, controller.signal)).resolves.toBe(
        [
          'k35o の issue と PR（更新の新しい順・全 0 件・1 ページ目）',
          '（当たりはありません）',
          'k35o の外の 1 件は出していません',
        ].join('\n'),
      );
      expect(searchGithubIssues).toHaveBeenCalledExactlyOnceWith(
        { query: undefined, repo: undefined, page: 1 },
        controller.signal,
      );
    });
  });
});

describe('read_github_issue', () => {
  describe('正常系', () => {
    it('issue は、本文とコメントを、書いた人とその関わりを添えて出す', async () => {
      vi.mocked(fetchGithubIssue).mockResolvedValue(
        issue({ comments: 1, labels: ['bug', 'ai'] }),
      );
      vi.mocked(fetchGithubIssueComments).mockResolvedValue({
        items: [comment()],
        hasNext: false,
      });

      await expect(readIssue({ repo: 'k8o', number: 12 })).resolves.toBe(
        [
          'k35o/k8o#12 [issue・open] 一覧が空になる',
          '@someone（NONE）作成 2026-10-19T00:00:00Z 更新 2026-10-20T00:00:00Z',
          'ラベル: bug, ai',
          '',
          '再読み込みすると一覧が空になります',
          '',
          '## コメント（1〜1 件目・全 1 件）',
          '',
          '### @k35o（OWNER）2026-10-20T00:00:00Z',
          '直しました',
        ].join('\n'),
      );
      expect(fetchGithubPull).not.toHaveBeenCalled();
      expect(fetchGithubPullFiles).not.toHaveBeenCalled();
    });

    it('PR は、枝（owner:枝）・head の SHA・変更したファイルの一覧も出す', async () => {
      vi.mocked(fetchGithubIssue).mockResolvedValue(
        issue({
          number: 2212,
          title: 'feat(ai): 生成物のページ',
          isPullRequest: true,
          author: 'k35o',
          authorAssociation: 'OWNER',
          body: '',
        }),
      );
      vi.mocked(fetchGithubPull).mockResolvedValue(pull());
      vi.mocked(fetchGithubPullFiles).mockResolvedValue([
        pullFile(),
        pullFile({
          status: 'renamed',
          path: 'apps/ai/src/a.ts',
          previousPath: 'apps/ai/src/b.ts',
          additions: 1,
          deletions: 1,
        }),
      ]);

      await expect(readIssue({ repo: 'k8o', number: 2212 })).resolves.toBe(
        [
          'k35o/k8o#2212 [PR・open] feat(ai): 生成物のページ',
          '@k35o（OWNER）作成 2026-10-19T00:00:00Z 更新 2026-10-20T00:00:00Z',
          'ラベル: なし',
          '枝: k35o:feat/ai-remove-studio → main（draft でない・コミット 3・+120 −340・ファイル 2）',
          'head の SHA: 0123456789abcdef0123456789abcdef01234567',
          '',
          '（本文はありません）',
          '',
          '## 変更したファイル（2 件）',
          'modified\tapps/ai/src/proxy.ts\t+12 −3',
          'renamed\tapps/ai/src/a.ts（元 apps/ai/src/b.ts）\t+1 −1',
          '',
          '## コメント（なし）',
        ].join('\n'),
      );
    });

    it('コメントのページの番号と中断のシグナルを、4 つの API の呼び出しに渡す', async () => {
      vi.mocked(fetchGithubIssue).mockResolvedValue(
        issue({ isPullRequest: true }),
      );
      vi.mocked(fetchGithubPull).mockResolvedValue(pull());
      vi.mocked(fetchGithubPullFiles).mockResolvedValue([]);
      const controller = new AbortController();

      await readIssue({ repo: 'k8o', number: 12, page: 2 }, controller.signal);

      const target = { repo: 'k8o', number: 12 };
      expect(fetchGithubIssue).toHaveBeenCalledExactlyOnceWith(
        target,
        controller.signal,
      );
      expect(fetchGithubIssueComments).toHaveBeenCalledExactlyOnceWith(
        { ...target, page: 2 },
        controller.signal,
      );
      expect(fetchGithubPull).toHaveBeenCalledExactlyOnceWith(
        target,
        controller.signal,
      );
      expect(fetchGithubPullFiles).toHaveBeenCalledExactlyOnceWith(
        target,
        controller.signal,
      );
    });
  });

  describe('エッジケース', () => {
    it('本文を 10,000 字、コメントを 2,500 字で切り、コメントの番号と次のページを書く', async () => {
      vi.mocked(fetchGithubIssue).mockResolvedValue(
        issue({ comments: 12, body: '🍣'.repeat(10_001) }),
      );
      vi.mocked(fetchGithubIssueComments).mockResolvedValue({
        items: [
          comment({ body: 'あ'.repeat(2501) }),
          comment({ author: 'k8o-bot[bot]', authorAssociation: 'NONE' }),
        ],
        hasNext: true,
      });

      await expect(
        readIssue({ repo: 'k8o', number: 12, page: 2 }),
      ).resolves.toBe(
        [
          'k35o/k8o#12 [issue・open] 一覧が空になる',
          '@someone（NONE）作成 2026-10-19T00:00:00Z 更新 2026-10-20T00:00:00Z',
          'ラベル: なし',
          '',
          '🍣'.repeat(10_000),
          '（本文を 10,000 字で切りました。全 10,001 字）',
          '',
          '## コメント（11〜12 件目・全 12 件）',
          '',
          '### @k35o（OWNER）2026-10-20T00:00:00Z',
          'あ'.repeat(2500),
          '（コメントを 2,500 字で切りました。全 2,501 字）',
          '',
          '### @k8o-bot[bot]（NONE）2026-10-20T00:00:00Z',
          '直しました',
          '次のページがあります（page: 3）',
        ].join('\n'),
      );
    });

    it('コメントのあるページを過ぎたら、そう書く', async () => {
      vi.mocked(fetchGithubIssue).mockResolvedValue(issue({ comments: 3 }));

      const output = String(
        await readIssue({ repo: 'k8o', number: 12, page: 2 }),
      );

      expect(output.split('\n').at(-1)).toBe(
        '## コメント（全 3 件。2 ページ目にはありません）',
      );
    });

    it('変更したファイルが出した件数より多ければ、全体の件数を書く', async () => {
      vi.mocked(fetchGithubIssue).mockResolvedValue(
        issue({ isPullRequest: true }),
      );
      vi.mocked(fetchGithubPull).mockResolvedValue(pull({ changedFiles: 312 }));
      vi.mocked(fetchGithubPullFiles).mockResolvedValue(
        Array.from({ length: 100 }, () => pullFile()),
      );

      const output = String(await readIssue({ repo: 'k8o', number: 12 }));

      expect(output).toContain(
        `## 変更したファイル（312 件）\n${'modified\tapps/ai/src/proxy.ts\t+12 −3\n'.repeat(100)}（100 件まで出しました。全 312 件）`,
      );
    });

    it('head のリポジトリが消えた PR でも、枝の名前・SHA・変更したファイルを出す', async () => {
      vi.mocked(fetchGithubIssue).mockResolvedValue(
        issue({ isPullRequest: true, state: 'closed' }),
      );
      vi.mocked(fetchGithubPull).mockResolvedValue(
        pull({
          headOwner: null,
          headRef: 'patch-1',
          headSha: 'fedcba9876543210fedcba9876543210fedcba98',
          isDraft: true,
          changedFiles: 1,
        }),
      );
      vi.mocked(fetchGithubPullFiles).mockResolvedValue([pullFile()]);

      const output = String(await readIssue({ repo: 'k8o', number: 12 }));

      expect(output).toContain(
        [
          '枝: patch-1 → main（draft・コミット 3・+120 −340・ファイル 1）',
          '（head のリポジトリは削除されています）',
          'head の SHA: fedcba9876543210fedcba9876543210fedcba98',
        ].join('\n'),
      );
      expect(output).toContain(
        '## 変更したファイル（1 件）\nmodified\tapps/ai/src/proxy.ts\t+12 −3',
      );
    });
  });
});
