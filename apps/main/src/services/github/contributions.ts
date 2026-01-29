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

/**
 * GitHubのcontributionLevelを数値レベルに変換
 */
function getLevelFromContributionLevel(level: string): number {
  const levelMap: Record<string, number> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };
  return levelMap[level] || 0;
}

/**
 * 直近の期間の日付範囲を計算
 */
function _getLastWeeksDateRange(): { from: string; to: string; days: number } {
  const now = new Date();
  const to = now.toISOString().split('T')[0] || '';
  const from = new Date(now);
  const days = LAST_DAY_INDEX; // 0..LAST_DAY_INDEX
  from.setDate(now.getDate() - days);
  return {
    from: from.toISOString().split('T')[0] || '',
    to,
    days,
  };
}

/**
 * Octokitを使用してGitHubコントリビューションデータを取得（直近10週間）
 */
export async function fetchGitHubContributions(
  username: string,
): Promise<ContributionWeek[]> {
  const token = process.env['GITHUB_TOKEN'];

  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const octokit = new Octokit({ auth: token });

  const { from, to } = _getLastWeeksDateRange();

  const query = `
    query($userName:String!, $from:DateTime!, $to:DateTime!) {
      user(login: $userName){
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const response = await octokit.graphql<{
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }>;
          }>;
        };
      };
    };
  }>(query, {
    userName: username,
    from: `${from}T00:00:00Z`,
    to: `${to}T23:59:59Z`,
  });

  const apiWeeks =
    response.user.contributionsCollection.contributionCalendar.weeks;

  // APIから返されたデータを日付ごとにマップに変換
  const contributionMap = new Map<string, { count: number; level: number }>();
  for (const week of apiWeeks) {
    for (const day of week.contributionDays) {
      contributionMap.set(day.date, {
        count: day.contributionCount,
        level: getLevelFromContributionLevel(day.contributionLevel),
      });
    }
  }

  // 日付を生成してweeks形式に変換（7日ごとに区切る）
  const weeks: ContributionWeek[] = [];
  let currentWeek: ContributionDay[] = [];
  const fromDate = new Date(from);

  for (let i = 0; i <= LAST_DAY_INDEX; i++) {
    const date = new Date(fromDate);
    date.setDate(fromDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    if (!dateStr) continue;

    const data = contributionMap.get(dateStr) || { count: 0, level: 0 };

    currentWeek.push({
      date: dateStr,
      count: data.count,
      level: data.level,
    });

    // 7日ごとまたは最後の日付でweekを区切る
    if (currentWeek.length === DAYS_PER_WEEK || i === LAST_DAY_INDEX) {
      weeks.push({ days: [...currentWeek] });
      currentWeek = [];
    }
  }

  return weeks;
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
    query($userName:String!, $from:DateTime!, $to:DateTime!, $after:String) {
      user(login: $userName) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              owner {
                login
              }
              name
            }
            contributions(first: 100, after: $after) {
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
    const fetchPage = async (after: string | null): Promise<void> => {
      const response: ContributionResponse = await octokit.graphql(query, {
        userName: username,
        from: `${from}T00:00:00Z`,
        to: `${to}T23:59:59Z`,
        after,
      });

      const repoContributions:
        | ContributionResponse['user']['contributionsCollection']['commitContributionsByRepository'][number]
        | undefined =
        response.user.contributionsCollection.commitContributionsByRepository.find(
          (r) =>
            r.repository.owner.login === owner && r.repository.name === repo,
        );

      if (!repoContributions) {
        return;
      }

      for (const contribution of repoContributions.contributions.nodes) {
        const date = contribution.occurredAt.split('T')[0];
        if (date) {
          contributionMap.set(
            date,
            (contributionMap.get(date) || 0) + contribution.commitCount,
          );
        }
      }

      if (repoContributions.contributions.pageInfo.hasNextPage) {
        const nextAfter = repoContributions.contributions.pageInfo.endCursor;
        if (nextAfter) {
          await fetchPage(nextAfter);
        }
      }
    };

    await fetchPage(null);

    // 日付を生成してweeks形式に変換（7日ごとに区切る）
    const weeks: ContributionWeek[] = [];
    let currentWeek: ContributionDay[] = [];
    const fromDate = new Date(from);

    for (let i = 0; i <= LAST_DAY_INDEX; i++) {
      const date = new Date(fromDate);
      date.setDate(fromDate.getDate() + i);
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
    // エラー時は空のデータを返す
    return [];
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
