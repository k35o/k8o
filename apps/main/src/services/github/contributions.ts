import { Octokit } from 'octokit';

export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type ContributionWeek = {
  days: ContributionDay[];
};

const DAYS_PER_WEEK = 7;
const CONTRIBUTION_WEEKS = 10;
const DAYS_RANGE = DAYS_PER_WEEK * CONTRIBUTION_WEEKS;
const LAST_DAY_INDEX = DAYS_RANGE - 1;
const GITHUB_CONTRIBUTION_PAGE_SIZE = 100;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY = 1;
const ONE_MILLISECOND = 1;

type ContributionResponse = {
  user: {
    contributionsCollection: {
      commitContributionsByRepository: Array<{
        repository: {
          owner: {
            login: string;
          };
          name: string;
        };
        contributions: {
          totalCount: number;
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
          nodes: Array<{
            occurredAt: string;
            commitCount: number;
          }>;
        };
      }>;
    };
  };
};

type RepositoryContributions =
  ContributionResponse['user']['contributionsCollection']['commitContributionsByRepository'][number];

/**
 * 直近の期間の日付範囲を計算
 */
function _getLastWeeksDateRange(): { from: string; to: string; days: number } {
  const now = new Date();
  const toDate = _getJstDateBase(now);
  const to = _formatDateString(toDate);
  const from = new Date(toDate);
  const days = LAST_DAY_INDEX; // 0..LAST_DAY_INDEX
  from.setUTCDate(toDate.getUTCDate() - days);
  return {
    from: _formatDateString(from),
    to,
    days,
  };
}

/**
 * k8oリポジトリ専用のコントリビューションデータを取得（直近10週間）
 */
export async function fetchK8oRepositoryContributions(
  username: string,
  owner: string,
  repo: string,
): Promise<ContributionWeek[]> {
  const token = process.env['GITHUB_TOKEN'];

  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const octokit = new Octokit({ auth: token });

  const { from, to } = _getLastWeeksDateRange();

  // GitHub GraphQL APIで直接リポジトリのコントリビューションを取得
  const query = `
    query($userName:String!, $from:DateTime!, $to:DateTime!, $after:String, $pageSize:Int!) {
      user(login: $userName) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              owner {
                login
              }
              name
            }
            contributions(first: $pageSize, after: $after) {
              totalCount
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                occurredAt
                commitCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    // 指定されたリポジトリのコントリビューションのみを抽出し、全ページを取得
    const contributionMap = new Map<string, number>();
    const createRepoContributionsIterator =
      (): AsyncIterable<RepositoryContributions> => {
        let cursor: string | null = null;
        let done = false;

        return {
          [Symbol.asyncIterator]: () => ({
            next: async () => {
              if (done) {
                return { done: true, value: undefined };
              }

              let response: ContributionResponse;
              try {
                response = await octokit.graphql(query, {
                  userName: username,
                  from: _getJstUtcStart(from),
                  to: _getJstUtcEnd(to),
                  after: cursor,
                  pageSize: GITHUB_CONTRIBUTION_PAGE_SIZE,
                });
              } catch (error) {
                done = true;
                console.error(
                  'Failed to fetch repository contributions page:',
                  {
                    error,
                    cursor,
                    username,
                    owner,
                    repo,
                  },
                );
                throw error;
              }

              const repoContributions =
                response.user.contributionsCollection.commitContributionsByRepository.find(
                  (r) =>
                    r.repository.owner.login === owner &&
                    r.repository.name === repo,
                );

              if (!repoContributions) {
                done = true;
                return { done: true, value: undefined };
              }

              const pageInfo = repoContributions.contributions.pageInfo;
              if (pageInfo.hasNextPage && pageInfo.endCursor) {
                cursor = pageInfo.endCursor;
              } else {
                done = true;
              }

              return { done: false, value: repoContributions };
            },
          }),
        };
      };

    for await (const repoContributions of createRepoContributionsIterator()) {
      for (const contribution of repoContributions.contributions.nodes) {
        const date = contribution.occurredAt.split('T')[0];
        if (date) {
          contributionMap.set(
            date,
            (contributionMap.get(date) || 0) + contribution.commitCount,
          );
        }
      }
    }

    // 日付を生成してweeks形式に変換（7日ごとに区切る）
    const weeks: ContributionWeek[] = [];
    let currentWeek: ContributionDay[] = [];
    const fromDate = new Date(`${from}T00:00:00Z`);

    for (let i = 0; i <= LAST_DAY_INDEX; i++) {
      const date = new Date(fromDate);
      date.setUTCDate(fromDate.getUTCDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      if (!dateStr) continue;

      const count = contributionMap.get(dateStr) || 0;
      const level = getLevelFromCount(count);

      currentWeek.push({
        date: dateStr,
        count,
        level,
      });

      // 7日ごとまたは最後の日付でweekを区切る
      if (currentWeek.length === DAYS_PER_WEEK || i === LAST_DAY_INDEX) {
        weeks.push({ days: [...currentWeek] });
        currentWeek = [];
      }
    }

    return weeks;
  } catch (error) {
    console.error('Failed to fetch repository contributions:', error);
    if (error instanceof Error) {
      throw new Error(`GitHub API Error: ${error.message}`, { cause: error });
    }
    throw error;
  }
}

/**
 * コントリビューション数からレベルを計算（簡易版）
 */
function getLevelFromCount(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function _getJstDateBase(date: Date): Date {
  const jst = new Date(date.getTime() + JST_OFFSET_MS);
  return new Date(
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()),
  );
}

function _formatDateString(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

function _getJstUtcStart(dateString: string): string {
  const [year, month, day] = _parseDateString(dateString);
  const utc = new Date(Date.UTC(year, month - 1, day) - JST_OFFSET_MS);
  return utc.toISOString();
}

function _getJstUtcEnd(dateString: string): string {
  const [year, month, day] = _parseDateString(dateString);
  // JST日付の23:59:59.999を表現するため、翌日の00:00:00から1ミリ秒引く
  const utc = new Date(
    Date.UTC(year, month - 1, day + ONE_DAY) - JST_OFFSET_MS - ONE_MILLISECOND,
  );
  return utc.toISOString();
}

function _parseDateString(dateString: string): [number, number, number] {
  const [year, month, day] = dateString.split('-');

  if (!(year && month && day)) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  return [Number(year), Number(month), Number(day)];
}

export const __test__ = {
  getJstUtcStart: _getJstUtcStart,
  getJstUtcEnd: _getJstUtcEnd,
};
