import 'server-only';
import * as z from 'zod/mini';

const GITHUB_API_ORIGIN = 'https://api.github.com';
export const GITHUB_OWNER = 'k35o';
const GITHUB_API_VERSION = '2026-03-10';
const USER_AGENT = 'ai.k8o.me';

const JSON_MEDIA_TYPE = 'application/vnd.github+json';
const OBJECT_MEDIA_TYPE = 'application/vnd.github.object+json';
const TEXT_MATCH_MEDIA_TYPE = 'application/vnd.github.text-match+json';

const REPOS_PER_PAGE = 100;
const CODE_RESULTS_PER_PAGE = 20;
const ISSUE_RESULTS_PER_PAGE = 30;
export const COMMENTS_PER_PAGE = 10;
const PULL_FILES_PER_PAGE = 100;
const RATE_LIMIT_FALLBACK_SECONDS = 60;

const githubToken = (): string => {
  const token = process.env['GITHUB_READ_TOKEN'];
  if (!token) {
    throw new Error('GITHUB_READ_TOKEN が設定されていません');
  }
  // 改行などヘッダーに使えない文字があると、fetch が投げる TypeError の文にトークンが
  // まるごと入り、tool のエラー文として保存されるので、GitHub を呼ぶ前に値を入れない文で弾く
  if (!/^[A-Za-z0-9_]+$/u.test(token)) {
    throw new Error(
      'GITHUB_READ_TOKEN に英数字と _ のほかの文字（改行など）が入っています',
    );
  }
  return token;
};

// モデルが決めた値は区切りごとに符号化して pathname に置き、URL の先頭には置かない。
// `..` は符号化しても `..` のままで、URL の正規化で上の階層の口へ抜けるので弾く
const githubUrl = (
  segments: readonly string[],
  query: Readonly<Record<string, string | undefined>>,
): URL => {
  if (segments.some((segment) => ['', '.', '..'].includes(segment))) {
    throw new Error('パスの区切りに、空・.・.. は使えません');
  }
  const url = new URL(GITHUB_API_ORIGIN);
  url.pathname = `/${segments.map(encodeURIComponent).join('/')}`;
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }
  return url;
};

const readSeconds = (headers: Headers, name: string): number | null => {
  const value = headers.get(name);
  return value !== null && /^\d+$/u.test(value) ? Number(value) : null;
};

const rateLimitWaitSeconds = (headers: Headers): number | null => {
  const retryAfter = readSeconds(headers, 'retry-after');
  if (retryAfter !== null) {
    return retryAfter;
  }
  if (readSeconds(headers, 'x-ratelimit-remaining') !== 0) {
    return null;
  }
  const reset = readSeconds(headers, 'x-ratelimit-reset');
  return reset === null
    ? RATE_LIMIT_FALLBACK_SECONDS
    : Math.max(reset - Math.floor(Date.now() / 1000), 1);
};

// エラー文は tool の結果として保存され毎ターン送り返されるので、応答の本文も、リポジトリ名や
// パスも入れずに状態のコードから作る。ログも同じく、口の形と状態のコードだけを残す
const statusError = (endpoint: string, res: Response): Error => {
  const { status } = res;
  if (status === 404) {
    return new Error(
      '見つかりません。名前・パス・番号が違うか、読む権限がありません',
    );
  }
  if (status === 422) {
    return new Error(
      'GitHub が要求を受け付けませんでした。検索語の形・リポジトリの名前・ページの番号を見直してください',
    );
  }
  console.error(`GitHub の ${endpoint} が ${status.toString()} を返しました`);
  if (status === 401) {
    return new Error('GitHub のトークンが無効か、期限が切れています');
  }
  if (status === 403 || status === 429) {
    const wait =
      rateLimitWaitSeconds(res.headers) ??
      (status === 429 ? RATE_LIMIT_FALLBACK_SECONDS : null);
    return new Error(
      wait === null
        ? 'GitHub に断られました。トークンにこの読み取りの権限が無いか、呼び出しが多すぎます'
        : `GitHub の呼び出しの上限に達しました。${wait.toString()} 秒たってから呼んでください`,
    );
  }
  if (status >= 300 && status < 400) {
    return new Error(
      'GitHub が別の場所を指しました。リポジトリの名前が変わったかもしれません。list_github_repos で名前を確かめてください',
    );
  }
  return new Error(
    `GitHub の ${endpoint} が ${status.toString()} を返しました`,
  );
};

const shapeError = (endpoint: string): Error => {
  console.error(`GitHub の ${endpoint} の応答の形が想定と違いました`);
  return new Error('GitHub の応答の形が想定と違いました');
};

type GithubRequest = {
  // ログとエラー文に出す口の形。モデルが決めた値は入れない
  endpoint: string;
  segments: readonly string[];
  query?: Readonly<Record<string, string | undefined>>;
  accept?: string;
  signal: AbortSignal | undefined;
};

const githubGet = async <T>(
  request: GithubRequest,
  schema: z.ZodMiniType<T>,
): Promise<{ body: T; hasNext: boolean }> => {
  const url = githubUrl(request.segments, request.query ?? {});
  const res = await fetch(url, {
    headers: {
      Accept: request.accept ?? JSON_MEDIA_TYPE,
      Authorization: `Bearer ${githubToken()}`,
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    },
    // 追うと行き先を確かめる仕組みが要るので、3xx はエラーにする
    redirect: 'manual',
    signal: request.signal ?? null,
  });
  if (res.status !== 200) {
    throw statusError(request.endpoint, res);
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch (error) {
    // SyntaxError の文には応答の本文の頭が入るので、そのまま投げない
    if (error instanceof SyntaxError) {
      throw shapeError(request.endpoint);
    }
    throw error;
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw shapeError(request.endpoint);
  }
  return {
    body: parsed.data,
    hasNext: (res.headers.get('link') ?? '').includes('rel="next"'),
  };
};

const repoPath = (repo: string): string[] => ['repos', GITHUB_OWNER, repo];

const scopeQualifier = (repo: string | undefined): string =>
  repo === undefined ? `user:${GITHUB_OWNER}` : `repo:${GITHUB_OWNER}/${repo}`;

// 検索語に修飾子を書かれると範囲が広がるので、結果も k35o のものに絞る。
// GitHub は名前の大文字小文字を区別しないので、比べるときもそろえる
const isInScope = (
  owner: string,
  name: string,
  repo: string | undefined,
): boolean =>
  owner.toLowerCase() === GITHUB_OWNER &&
  (repo === undefined || name.toLowerCase() === repo.toLowerCase());

const userSchema = z.nullable(z.object({ login: z.string() }));

// 削除されたアカウントは user が null になる。GitHub の画面と同じく ghost と呼ぶ
const loginOf = (user: z.infer<typeof userSchema>): string =>
  user?.login ?? 'ghost';

const pullRequestMarkSchema = z.optional(
  z.object({ merged_at: z.optional(z.nullable(z.string())) }),
);

const stateOf = (item: {
  state: string;
  pull_request?: z.infer<typeof pullRequestMarkSchema>;
}): string => (item.pull_request?.merged_at ? 'merged' : item.state);

export type GithubPage<T> = { items: T[]; hasNext: boolean };

export type GithubSearchPage<T> = GithubPage<T> & {
  totalCount: number;
  incompleteResults: boolean;
  omitted: number;
};

const repoSchema = z.object({
  name: z.string(),
  private: z.boolean(),
  fork: z.boolean(),
  archived: z.boolean(),
  default_branch: z.string(),
  pushed_at: z.nullable(z.string()),
  description: z.nullable(z.string()),
});

export type GithubRepo = {
  name: string;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  defaultBranch: string;
  pushedAt: string | null;
  description: string | null;
};

export const fetchGithubRepos = async (
  page: number,
  signal: AbortSignal | undefined,
): Promise<GithubPage<GithubRepo>> => {
  const { body, hasNext } = await githubGet(
    {
      endpoint: `/users/${GITHUB_OWNER}/repos`,
      segments: ['users', GITHUB_OWNER, 'repos'],
      query: {
        type: 'owner',
        sort: 'pushed',
        per_page: REPOS_PER_PAGE.toString(),
        page: page.toString(),
      },
      signal,
    },
    z.array(repoSchema),
  );
  return {
    items: body.map((repo) => ({
      name: repo.name,
      isPrivate: repo.private,
      isFork: repo.fork,
      isArchived: repo.archived,
      defaultBranch: repo.default_branch,
      pushedAt: repo.pushed_at,
      description: repo.description,
    })),
    hasNext,
  };
};

const contentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('file'),
    size: z.number(),
    encoding: z.enum(['base64', 'none']),
    content: z.string(),
  }),
  z.object({
    type: z.literal('dir'),
    entries: z.array(
      z.object({ type: z.string(), name: z.string(), size: z.number() }),
    ),
  }),
  z.object({ type: z.literal('symlink') }),
  z.object({ type: z.literal('submodule') }),
]);

export type GithubDirEntry = { type: string; name: string; size: number };

export type GithubContent =
  | { type: 'file'; size: number; text: string }
  | { type: 'binary'; size: number }
  | { type: 'too-large'; size: number }
  | { type: 'dir'; entries: GithubDirEntry[] }
  | { type: 'symlink' | 'submodule' };

export const fetchGithubContent = async (
  input: { repo: string; path: string; ref: string | undefined },
  signal: AbortSignal | undefined,
): Promise<GithubContent> => {
  const { body } = await githubGet(
    {
      endpoint: `/repos/${GITHUB_OWNER}/{repo}/contents/{path}`,
      segments: [
        ...repoPath(input.repo),
        'contents',
        ...(input.path === '' ? [] : input.path.split('/')),
      ],
      query: { ref: input.ref },
      accept: OBJECT_MEDIA_TYPE,
      signal,
    },
    contentSchema,
  );
  switch (body.type) {
    case 'file': {
      // 1 MB を超えるファイルは、GitHub が中身を入れずに encoding を none にして返す
      if (body.encoding === 'none') {
        return { type: 'too-large', size: body.size };
      }
      const bytes = Buffer.from(body.content, 'base64');
      return bytes.includes(0)
        ? { type: 'binary', size: body.size }
        : { type: 'file', size: body.size, text: bytes.toString('utf8') };
    }
    case 'dir':
      return { type: 'dir', entries: body.entries };
    case 'symlink':
    case 'submodule':
      return { type: body.type };
  }
};

const codeSearchSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(
    z.object({
      path: z.string(),
      repository: z.object({
        name: z.string(),
        owner: z.object({ login: z.string() }),
      }),
      text_matches: z.optional(z.array(z.object({ fragment: z.string() }))),
    }),
  ),
});

export type GithubCodeMatch = {
  repo: string;
  path: string;
  fragments: string[];
};

export const searchGithubCode = async (
  input: { query: string; repo: string | undefined; page: number },
  signal: AbortSignal | undefined,
): Promise<GithubSearchPage<GithubCodeMatch>> => {
  const { body, hasNext } = await githubGet(
    {
      endpoint: '/search/code',
      segments: ['search', 'code'],
      query: {
        q: `${input.query} ${scopeQualifier(input.repo)}`,
        per_page: CODE_RESULTS_PER_PAGE.toString(),
        page: input.page.toString(),
      },
      accept: TEXT_MATCH_MEDIA_TYPE,
      signal,
    },
    codeSearchSchema,
  );
  const items = body.items.filter((item) =>
    isInScope(item.repository.owner.login, item.repository.name, input.repo),
  );
  return {
    totalCount: body.total_count,
    incompleteResults: body.incomplete_results,
    omitted: body.items.length - items.length,
    items: items.map((item) => ({
      repo: item.repository.name,
      path: item.path,
      fragments: (item.text_matches ?? []).map((match) => match.fragment),
    })),
    hasNext,
  };
};

const issueSearchSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(
    z.object({
      repository_url: z.string(),
      number: z.number(),
      title: z.string(),
      state: z.string(),
      user: userSchema,
      author_association: z.string(),
      comments: z.number(),
      updated_at: z.string(),
      pull_request: pullRequestMarkSchema,
    }),
  ),
});

// 名前を取り出すために割るだけで、URL はたどらない
const REPOSITORY_URL_PATTERN =
  /^https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)$/u;

export type GithubIssueSummary = {
  repo: string;
  number: number;
  title: string;
  isPullRequest: boolean;
  state: string;
  author: string;
  authorAssociation: string;
  comments: number;
  updatedAt: string;
};

export const searchGithubIssues = async (
  input: { query: string | undefined; repo: string | undefined; page: number },
  signal: AbortSignal | undefined,
): Promise<GithubSearchPage<GithubIssueSummary>> => {
  const { body, hasNext } = await githubGet(
    {
      endpoint: '/search/issues',
      segments: ['search', 'issues'],
      query: {
        q:
          input.query === undefined
            ? scopeQualifier(input.repo)
            : `${input.query} ${scopeQualifier(input.repo)}`,
        sort: 'updated',
        order: 'desc',
        per_page: ISSUE_RESULTS_PER_PAGE.toString(),
        page: input.page.toString(),
      },
      signal,
    },
    issueSearchSchema,
  );
  const items = body.items.flatMap((item): GithubIssueSummary[] => {
    const [, owner = '', name = ''] =
      REPOSITORY_URL_PATTERN.exec(item.repository_url) ?? [];
    if (!isInScope(owner, name, input.repo)) {
      return [];
    }
    return [
      {
        repo: name,
        number: item.number,
        title: item.title,
        isPullRequest: item.pull_request !== undefined,
        state: stateOf(item),
        author: loginOf(item.user),
        authorAssociation: item.author_association,
        comments: item.comments,
        updatedAt: item.updated_at,
      },
    ];
  });
  return {
    totalCount: body.total_count,
    incompleteResults: body.incomplete_results,
    omitted: body.items.length - items.length,
    items,
    hasNext,
  };
};

const issueSchema = z.object({
  number: z.number(),
  title: z.string(),
  state: z.string(),
  user: userSchema,
  author_association: z.string(),
  comments: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  labels: z.array(z.object({ name: z.string() })),
  body: z.nullable(z.string()),
  pull_request: pullRequestMarkSchema,
});

export type GithubIssue = {
  number: number;
  title: string;
  isPullRequest: boolean;
  state: string;
  author: string;
  authorAssociation: string;
  comments: number;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  body: string;
};

export const fetchGithubIssue = async (
  input: { repo: string; number: number },
  signal: AbortSignal | undefined,
): Promise<GithubIssue> => {
  const { body: issue } = await githubGet(
    {
      endpoint: `/repos/${GITHUB_OWNER}/{repo}/issues/{number}`,
      segments: [...repoPath(input.repo), 'issues', input.number.toString()],
      signal,
    },
    issueSchema,
  );
  return {
    number: issue.number,
    title: issue.title,
    isPullRequest: issue.pull_request !== undefined,
    state: stateOf(issue),
    author: loginOf(issue.user),
    authorAssociation: issue.author_association,
    comments: issue.comments,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    labels: issue.labels.map((label) => label.name),
    body: issue.body ?? '',
  };
};

const commentSchema = z.object({
  user: userSchema,
  author_association: z.string(),
  created_at: z.string(),
  body: z.optional(z.string()),
});

export type GithubComment = {
  author: string;
  authorAssociation: string;
  createdAt: string;
  body: string;
};

export const fetchGithubIssueComments = async (
  input: { repo: string; number: number; page: number },
  signal: AbortSignal | undefined,
): Promise<GithubPage<GithubComment>> => {
  const { body, hasNext } = await githubGet(
    {
      endpoint: `/repos/${GITHUB_OWNER}/{repo}/issues/{number}/comments`,
      segments: [
        ...repoPath(input.repo),
        'issues',
        input.number.toString(),
        'comments',
      ],
      query: {
        per_page: COMMENTS_PER_PAGE.toString(),
        page: input.page.toString(),
      },
      signal,
    },
    z.array(commentSchema),
  );
  return {
    items: body.map((comment) => ({
      author: loginOf(comment.user),
      authorAssociation: comment.author_association,
      createdAt: comment.created_at,
      body: comment.body ?? '',
    })),
    hasNext,
  };
};

const pullSchema = z.object({
  draft: z.optional(z.boolean()),
  commits: z.number(),
  additions: z.number(),
  deletions: z.number(),
  changed_files: z.number(),
  head: z.object({
    ref: z.string(),
    sha: z.string(),
    repo: z.nullable(z.object({ owner: z.object({ login: z.string() }) })),
  }),
  base: z.object({ ref: z.string() }),
});

export type GithubPull = {
  // fork が消えると head のリポジトリが無くなり、null になる
  headOwner: string | null;
  headRef: string;
  headSha: string;
  baseRef: string;
  isDraft: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changedFiles: number;
};

export const fetchGithubPull = async (
  input: { repo: string; number: number },
  signal: AbortSignal | undefined,
): Promise<GithubPull> => {
  const { body: pull } = await githubGet(
    {
      endpoint: `/repos/${GITHUB_OWNER}/{repo}/pulls/{number}`,
      segments: [...repoPath(input.repo), 'pulls', input.number.toString()],
      signal,
    },
    pullSchema,
  );
  return {
    headOwner: pull.head.repo?.owner.login ?? null,
    headRef: pull.head.ref,
    headSha: pull.head.sha,
    baseRef: pull.base.ref,
    isDraft: pull.draft ?? false,
    commits: pull.commits,
    additions: pull.additions,
    deletions: pull.deletions,
    changedFiles: pull.changed_files,
  };
};

const pullFileSchema = z.object({
  filename: z.string(),
  status: z.string(),
  additions: z.number(),
  deletions: z.number(),
  previous_filename: z.optional(z.string()),
});

export type GithubPullFile = {
  status: string;
  path: string;
  previousPath: string | undefined;
  additions: number;
  deletions: number;
};

export const fetchGithubPullFiles = async (
  input: { repo: string; number: number },
  signal: AbortSignal | undefined,
): Promise<GithubPullFile[]> => {
  const { body } = await githubGet(
    {
      endpoint: `/repos/${GITHUB_OWNER}/{repo}/pulls/{number}/files`,
      segments: [
        ...repoPath(input.repo),
        'pulls',
        input.number.toString(),
        'files',
      ],
      query: { per_page: PULL_FILES_PER_PAGE.toString() },
      signal,
    },
    z.array(pullFileSchema),
  );
  return body.map((file) => ({
    status: file.status,
    path: file.filename,
    previousPath: file.previous_filename,
    additions: file.additions,
    deletions: file.deletions,
  }));
};
