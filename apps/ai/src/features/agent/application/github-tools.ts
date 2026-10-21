import { tool } from 'ai';
import * as z from 'zod/mini';

import {
  COMMENTS_PER_PAGE,
  fetchGithubContent,
  fetchGithubIssue,
  fetchGithubIssueComments,
  fetchGithubPull,
  fetchGithubPullFiles,
  fetchGithubRepos,
  GITHUB_OWNER,
  searchGithubCode,
  searchGithubIssues,
} from '../infrastructure/github-api';
import type {
  GithubCodeMatch,
  GithubComment,
  GithubDirEntry,
  GithubIssue,
  GithubIssueSummary,
  GithubPage,
  GithubPull,
  GithubPullFile,
  GithubRepo,
  GithubSearchPage,
} from '../infrastructure/github-api';

const MAX_OUTPUT_CHARS = 50_000;
const MAX_REPO_DESCRIPTION_CHARS = 200;
const MAX_ISSUE_TITLE_CHARS = 200;
const MAX_FRAGMENTS = 3;
const MAX_FRAGMENT_CHARS = 600;
const MAX_BODY_CHARS = 10_000;
const MAX_COMMENT_CHARS = 2500;

// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
const toChars = (text: string): string[] => Array.from(text);

const firstChars = (text: string, max: number): string =>
  toChars(text).slice(0, max).join('');

const shorten = (text: string, max: number): string =>
  toChars(text).length <= max ? text : `${firstChars(text, max)}…`;

const formatCount = (count: number): string => count.toLocaleString('en-US');

const truncate = (text: string, max: number, label: string): string => {
  const { length } = toChars(text);
  return length <= max
    ? text
    : `${firstChars(text, max)}\n（${label}を ${formatCount(max)} 字で切りました。全 ${formatCount(length)} 字）`;
};

const nextPage = (hasNext: boolean, page: number): string[] =>
  hasNext ? [`次のページがあります（page: ${(page + 1).toString()}）`] : [];

// 先頭から、改行を含めて max 字に収まる行の数
const countFittingLines = (lines: readonly string[], max: number): number => {
  let used = 0;
  for (const [index, line] of lines.entries()) {
    used += (index === 0 ? 0 : 1) + toChars(line).length;
    if (used > max) {
      return index;
    }
  }
  return lines.length;
};

const repoInput = z
  .string()
  .check(
    z.regex(/^[A-Za-z0-9._-]{1,100}$/u),
    z.describe('リポジトリの名前。k35o/ は付けない（例: k8o）'),
  );

const pageInput = z.optional(
  z
    .int()
    .check(
      z.positive(),
      z.describe(
        'ページの番号（1 から）。結果に次のページがあると書かれていたら、その番号を渡す',
      ),
    ),
);

const repoLine = (repo: GithubRepo): string => {
  const traits = [
    repo.isPrivate ? 'private' : 'public',
    ...(repo.isFork ? ['fork'] : []),
    `既定の枝 ${repo.defaultBranch}`,
    ...(repo.pushedAt === null ? [] : [`push ${repo.pushedAt}`]),
    ...(repo.isArchived ? ['archived'] : []),
  ];
  const description = repo.description
    ? `: ${shorten(repo.description, MAX_REPO_DESCRIPTION_CHARS)}`
    : '';
  return `- ${repo.name}（${traits.join('・')}）${description}`;
};

const formatRepos = (
  { items, hasNext }: GithubPage<GithubRepo>,
  page: number,
): string =>
  [
    `${GITHUB_OWNER} のリポジトリ（push の新しい順・${page.toString()} ページ目・${items.length.toString()} 件）`,
    ...items.map(repoLine),
    ...nextPage(hasNext, page),
  ].join('\n');

type Heading = (...traits: string[]) => string;

type LineRange = {
  startLine: number | undefined;
  endLine: number | undefined;
};

const formatFile = (
  heading: Heading,
  text: string,
  range: LineRange,
): string => {
  const lines = text === '' ? [] : text.replace(/\r?\n$/u, '').split(/\r?\n/u);
  const total = lines.length;
  if (total === 0) {
    return `${heading('全 0 行')}\n（空のファイルです）`;
  }
  const start = range.startLine ?? 1;
  if (range.endLine !== undefined && range.endLine < start) {
    throw new Error('endLine が startLine より小さいです');
  }
  if (start > total) {
    throw new Error(`startLine が行数（${total.toString()} 行）を超えています`);
  }
  const end = Math.min(range.endLine ?? total, total);
  const numbered = lines
    .slice(start - 1, end)
    .map((line, index) => `${(start + index).toString()}\t${line}`);
  const header = (last: number): string =>
    heading(
      `全 ${total.toString()} 行`,
      `${start.toString()}〜${last.toString()} 行目`,
    );
  // 実際に出す範囲の見出しは、頼まれた範囲の見出しより長くならないので、それで字数を見積もる
  const shown =
    countFittingLines([header(end), ...numbered], MAX_OUTPUT_CHARS) - 1;
  if (shown === numbered.length) {
    return [header(end), ...numbered].join('\n');
  }
  if (shown === 0) {
    const first = header(start);
    return [
      first,
      firstChars(
        numbered[0] ?? '',
        MAX_OUTPUT_CHARS - toChars(first).length - 1,
      ),
      start < total
        ? `（${start.toString()} 行目が長いので途中で切りました。続きの行は startLine: ${(start + 1).toString()} で読んでください）`
        : `（${start.toString()} 行目が長いので途中で切りました）`,
    ].join('\n');
  }
  const last = start + shown - 1;
  return [
    header(last),
    ...numbered.slice(0, shown),
    `（${last.toString()} 行目までを出しました。続きは startLine: ${(last + 1).toString()} で読んでください）`,
  ].join('\n');
};

const formatDir = (heading: Heading, entries: GithubDirEntry[]): string => {
  const header = heading('ディレクトリ', `${entries.length.toString()} 件`);
  const lines = entries.map((entry) =>
    entry.type === 'file'
      ? `file\t${entry.name}\t${formatCount(entry.size)} バイト`
      : `${entry.type}\t${entry.name}`,
  );
  const shown = countFittingLines([header, ...lines], MAX_OUTPUT_CHARS) - 1;
  return [
    header,
    ...lines.slice(0, shown),
    ...(shown < lines.length
      ? [
          `（${shown.toString()} 件まで出しました。全 ${lines.length.toString()} 件）`,
        ]
      : []),
  ].join('\n');
};

const scopeOf = (repo: string | undefined): string =>
  repo === undefined ? GITHUB_OWNER : `${GITHUB_OWNER}/${repo}`;

const searchNotes = <T>(
  result: GithubSearchPage<T>,
  page: number,
): string[] => [
  ...(result.incompleteResults
    ? ['（GitHub の検索が時間内に終わらず、結果が欠けているかもしれません）']
    : []),
  ...(result.omitted > 0
    ? [`${GITHUB_OWNER} の外の ${result.omitted.toString()} 件は出していません`]
    : []),
  ...nextPage(result.hasNext, page),
];

type SearchInput = {
  repo: string | undefined;
  page: number;
};

const formatCodeResults = (
  input: SearchInput & { query: string },
  result: GithubSearchPage<GithubCodeMatch>,
): string => {
  const items = result.items.flatMap((item) => [
    `## ${item.repo}: ${item.path}`,
    ...item.fragments
      .slice(0, MAX_FRAGMENTS)
      .map((fragment) => `…${firstChars(fragment, MAX_FRAGMENT_CHARS)}…`),
  ]);
  return [
    `「${input.query}」のコードの検索結果（${scopeOf(input.repo)}・全 ${result.totalCount.toString()} 件・${input.page.toString()} ページ目）`,
    ...(items.length === 0 ? ['（当たりはありません）'] : items),
    ...searchNotes(result, input.page),
  ].join('\n');
};

const kindOf = (item: { isPullRequest: boolean }): string =>
  item.isPullRequest ? 'PR' : 'issue';

const issueLine = (item: GithubIssueSummary): string =>
  `- ${item.repo}#${item.number.toString()} [${kindOf(item)}・${item.state}] ${shorten(item.title, MAX_ISSUE_TITLE_CHARS)}（@${item.author}・${item.authorAssociation}・コメント ${item.comments.toString()}・更新 ${item.updatedAt}）`;

const formatIssueResults = (
  input: SearchInput & { query: string | undefined },
  result: GithubSearchPage<GithubIssueSummary>,
): string => {
  const query = input.query === undefined ? '' : `「${input.query}」・`;
  return [
    `${scopeOf(input.repo)} の issue と PR（${query}更新の新しい順・全 ${result.totalCount.toString()} 件・${input.page.toString()} ページ目）`,
    ...(result.items.length === 0
      ? ['（当たりはありません）']
      : result.items.map(issueLine)),
    ...searchNotes(result, input.page),
  ].join('\n');
};

type PullWithFiles = { pull: GithubPull; files: GithubPullFile[] };

const fetchPullWithFiles = async (
  input: { repo: string; number: number },
  signal: AbortSignal | undefined,
): Promise<PullWithFiles> => {
  const [pull, files] = await Promise.all([
    fetchGithubPull(input, signal),
    fetchGithubPullFiles(input, signal),
  ]);
  return { pull, files };
};

const formatBranch = (pull: GithubPull): string[] => {
  const head =
    pull.headOwner === null
      ? pull.headRef
      : `${pull.headOwner}:${pull.headRef}`;
  return [
    `枝: ${head} → ${pull.baseRef}（${pull.isDraft ? 'draft' : 'draft でない'}・コミット ${pull.commits.toString()}・+${pull.additions.toString()} −${pull.deletions.toString()}・ファイル ${pull.changedFiles.toString()}）`,
    ...(pull.headOwner === null
      ? ['（head のリポジトリは削除されています）']
      : []),
    `head の SHA: ${pull.headSha}`,
  ];
};

const formatPullFiles = ({ pull, files }: PullWithFiles): string[] => [
  `## 変更したファイル（${pull.changedFiles.toString()} 件）`,
  ...files.map(
    (file) =>
      `${file.status}\t${file.path}${file.previousPath === undefined ? '' : `（元 ${file.previousPath}）`}\t+${file.additions.toString()} −${file.deletions.toString()}`,
  ),
  ...(files.length < pull.changedFiles
    ? [
        `（${files.length.toString()} 件まで出しました。全 ${pull.changedFiles.toString()} 件）`,
      ]
    : []),
];

const formatComments = (
  issue: GithubIssue,
  { items, hasNext }: GithubPage<GithubComment>,
  page: number,
): string[] => {
  const total = issue.comments.toString();
  if (items.length === 0) {
    return [
      issue.comments === 0
        ? '## コメント（なし）'
        : `## コメント（全 ${total} 件。${page.toString()} ページ目にはありません）`,
    ];
  }
  const first = (page - 1) * COMMENTS_PER_PAGE + 1;
  const last = first + items.length - 1;
  return [
    `## コメント（${first.toString()}〜${last.toString()} 件目・全 ${total} 件）`,
    ...items.flatMap((comment) => [
      '',
      `### @${comment.author}（${comment.authorAssociation}）${comment.createdAt}`,
      truncate(comment.body, MAX_COMMENT_CHARS, 'コメント'),
    ]),
    ...nextPage(hasNext, page),
  ];
};

const formatIssue = (input: {
  repo: string;
  page: number;
  issue: GithubIssue;
  comments: GithubPage<GithubComment>;
  pull: PullWithFiles | null;
}): string => {
  const { repo, page, issue, comments, pull } = input;
  return [
    `${GITHUB_OWNER}/${repo}#${issue.number.toString()} [${kindOf(issue)}・${issue.state}] ${issue.title}`,
    `@${issue.author}（${issue.authorAssociation}）作成 ${issue.createdAt} 更新 ${issue.updatedAt}`,
    `ラベル: ${issue.labels.length === 0 ? 'なし' : issue.labels.join(', ')}`,
    ...(pull === null ? [] : formatBranch(pull.pull)),
    '',
    issue.body === ''
      ? '（本文はありません）'
      : truncate(issue.body, MAX_BODY_CHARS, '本文'),
    ...(pull === null ? [] : ['', ...formatPullFiles(pull)]),
    '',
    ...formatComments(issue, comments, page),
  ].join('\n');
};

export const githubTools = {
  list_github_repos: tool({
    description:
      'k8o の GitHub のアカウント（k35o）のリポジトリの一覧（名前・公開か非公開か・フォークか・既定の枝・最後に push した日時・説明）を、push の新しい順に返す',
    inputSchema: z.object({ page: pageInput }),
    execute: async ({ page = 1 }, { abortSignal }): Promise<string> =>
      formatRepos(await fetchGithubRepos(page, abortSignal), page),
  }),
  read_github_file: tool({
    description:
      'k35o のリポジトリのファイルを行番号つきで読むか、ディレクトリの中身を一覧する。長いファイルは startLine・endLine で範囲を指して読む',
    inputSchema: z.object({
      repo: repoInput,
      path: z.optional(
        z
          .string()
          .check(
            z.maxLength(1024),
            z.describe(
              'リポジトリのルートからのパス（例: apps/ai/src/proxy.ts）。省くとルートのディレクトリ',
            ),
          ),
      ),
      ref: z.optional(
        z
          .string()
          .check(
            z.minLength(1),
            z.maxLength(255),
            z.describe(
              '枝・タグ・コミットの SHA。省くと既定の枝。PR の変更後のファイルは、read_github_issue が返す head の SHA を渡す',
            ),
          ),
      ),
      startLine: z.optional(
        z.int().check(z.positive(), z.describe('読み始める行（1 から）')),
      ),
      endLine: z.optional(
        z.int().check(z.positive(), z.describe('読み終える行（その行を含む）')),
      ),
    }),
    execute: async (
      { repo, path = '', ref, startLine, endLine },
      { abortSignal },
    ): Promise<string> => {
      const trimmed = path.replaceAll(/^\/+|\/+$/gu, '');
      const content = await fetchGithubContent(
        { repo, path: trimmed, ref },
        abortSignal,
      );
      const place = trimmed === '' ? 'ルート' : ` ${trimmed}`;
      const heading: Heading = (...traits) =>
        `${GITHUB_OWNER}/${repo} の${place}（${[`ref: ${ref ?? '既定の枝'}`, ...traits].join('・')}）`;
      switch (content.type) {
        case 'file':
          return formatFile(heading, content.text, { startLine, endLine });
        case 'dir':
          return formatDir(heading, content.entries);
        case 'binary':
          return `${heading()}\nバイナリのファイルなので中身を出しません（${formatCount(content.size)} バイト）`;
        case 'too-large':
          return `${heading()}\n1 MB を超えるファイルなので読めません（${formatCount(content.size)} バイト）`;
        case 'symlink':
        case 'submodule':
          return `${heading(content.type)}\nファイルでもディレクトリでもないので、中身を出しません`;
      }
    },
  }),
  search_github_code: tool({
    description:
      'k35o のリポジトリの既定の枝のコードを検索し、当たったファイルのパスと、当たった箇所の断片を返す。ファイルの全体は read_github_file で読む',
    inputSchema: z.object({
      query: z
        .string()
        .check(
          z.minLength(1),
          z.maxLength(256),
          z.describe(
            '検索語。GitHub のコード検索の修飾子（language:・path:・extension: など）も書ける。リポジトリは repo で絞り、user:・org:・repo: は書かない',
          ),
        ),
      repo: z.optional(repoInput),
      page: pageInput,
    }),
    execute: async (
      { query, repo, page = 1 },
      { abortSignal },
    ): Promise<string> => {
      const input = { query, repo, page };
      return formatCodeResults(
        input,
        await searchGithubCode(input, abortSignal),
      );
    },
  }),
  search_github_issues: tool({
    description:
      'k35o のリポジトリの issue と PR を検索し、番号・種類・状態・タイトル・書いた人・コメントの数を、更新の新しい順に返す。中身は read_github_issue で読む',
    inputSchema: z.object({
      query: z.optional(
        z
          .string()
          .check(
            z.minLength(1),
            z.maxLength(256),
            z.describe(
              '検索語と修飾子（is:pr・is:issue・is:open・author:・label: など）。省くとすべて。リポジトリは repo で絞り、user:・org:・repo: は書かない',
            ),
          ),
      ),
      repo: z.optional(repoInput),
      page: pageInput,
    }),
    execute: async (
      { query, repo, page = 1 },
      { abortSignal },
    ): Promise<string> => {
      const input = { query, repo, page };
      return formatIssueResults(
        input,
        await searchGithubIssues(input, abortSignal),
      );
    },
  }),
  read_github_issue: tool({
    description:
      'k35o のリポジトリの issue か PR を、本文とコメントごと読む。PR なら、枝・head の SHA・マージの状態と、変更したファイルの一覧（差分は含まない）も返す。変更後のファイルは、その SHA を ref に渡して read_github_file で読む。PR のレビューとコードへのコメントは含まない',
    inputSchema: z.object({
      repo: repoInput,
      number: z.int().check(z.positive(), z.describe('issue か PR の番号')),
      page: z.optional(
        z
          .int()
          .check(
            z.positive(),
            z.describe(
              'コメントのページの番号（1 から）。結果に次のページがあると書かれていたら、その番号を渡す',
            ),
          ),
      ),
    }),
    execute: async (
      { repo, number, page = 1 },
      { abortSignal },
    ): Promise<string> => {
      const [issue, comments] = await Promise.all([
        fetchGithubIssue({ repo, number }, abortSignal),
        fetchGithubIssueComments({ repo, number, page }, abortSignal),
      ]);
      const pull = issue.isPullRequest
        ? await fetchPullWithFiles({ repo, number }, abortSignal)
        : null;
      return formatIssue({ repo, page, issue, comments, pull });
    },
  }),
};
