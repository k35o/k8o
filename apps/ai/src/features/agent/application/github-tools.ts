import { tool } from 'ai';
import * as z from 'zod/mini';

import {
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
import {
  formatCodeResults,
  formatCount,
  formatDir,
  formatFile,
  formatIssue,
  formatIssueResults,
  formatRepos,
} from './github-format';
import type { Heading, PullWithFiles } from './github-format';
import { pageInputOf } from './page-input';

const repoInput = z
  .string()
  .check(
    z.regex(/^[A-Za-z0-9._-]{1,100}$/u),
    z.describe('リポジトリの名前。k35o/ は付けない（例: k8o）'),
  );

const pageInput = pageInputOf(
  'ページの番号（1 から）。結果に次のページがあると書かれていたら、その番号を渡す',
);

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
      page: pageInputOf(
        'コメントのページの番号（1 から）。結果に次のページがあると書かれていたら、その番号を渡す',
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
