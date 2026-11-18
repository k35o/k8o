import {
  countChars,
  firstChars,
  truncateChars,
  truncateCharsWith,
} from '@/shared/truncate-chars';

import { COMMENTS_PER_PAGE, GITHUB_OWNER } from '../infrastructure/github-api';
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

export const formatCount = (count: number): string =>
  count.toLocaleString('en-US');

const truncate = (text: string, max: number, label: string): string =>
  truncateCharsWith(
    text,
    max,
    (total) =>
      `\n（${label}を ${formatCount(max)} 字で切りました。全 ${formatCount(total)} 字）`,
  );

const nextPage = (hasNext: boolean, page: number): string[] =>
  hasNext ? [`次のページがあります（page: ${(page + 1).toString()}）`] : [];

// 先頭から、改行を含めて max 字に収まる行の数
const countFittingLines = (lines: readonly string[], max: number): number => {
  let used = 0;
  for (const [index, line] of lines.entries()) {
    used += (index === 0 ? 0 : 1) + countChars(line);
    if (used > max) {
      return index;
    }
  }
  return lines.length;
};
const repoLine = (repo: GithubRepo): string => {
  const traits = [
    repo.isPrivate ? 'private' : 'public',
    ...(repo.isFork ? ['fork'] : []),
    `既定の枝 ${repo.defaultBranch}`,
    ...(repo.pushedAt === null ? [] : [`push ${repo.pushedAt}`]),
    ...(repo.isArchived ? ['archived'] : []),
  ];
  const description = repo.description
    ? `: ${truncateChars(repo.description, MAX_REPO_DESCRIPTION_CHARS)}`
    : '';
  return `- ${repo.name}（${traits.join('・')}）${description}`;
};

export const formatRepos = (
  { items, hasNext }: GithubPage<GithubRepo>,
  page: number,
): string =>
  [
    `${GITHUB_OWNER} のリポジトリ（push の新しい順・${page.toString()} ページ目・${items.length.toString()} 件）`,
    ...items.map(repoLine),
    ...nextPage(hasNext, page),
  ].join('\n');

export type Heading = (...traits: string[]) => string;

type LineRange = {
  startLine: number | undefined;
  endLine: number | undefined;
};

export const formatFile = (
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
      firstChars(numbered[0] ?? '', MAX_OUTPUT_CHARS - countChars(first) - 1),
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

export const formatDir = (
  heading: Heading,
  entries: GithubDirEntry[],
): string => {
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

export const formatCodeResults = (
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
  `- ${item.repo}#${item.number.toString()} [${kindOf(item)}・${item.state}] ${truncateChars(item.title, MAX_ISSUE_TITLE_CHARS)}（@${item.author}・${item.authorAssociation}・コメント ${item.comments.toString()}・更新 ${item.updatedAt}）`;

export const formatIssueResults = (
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

export type PullWithFiles = { pull: GithubPull; files: GithubPullFile[] };

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

export const formatIssue = (input: {
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
