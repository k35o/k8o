import { Octokit } from 'octokit';
import {
  formatDateString,
  getJstDateBase,
  getJstUtcEnd,
  getJstUtcStart,
} from './jst';

export type ContributionDay = {
  date: string;
  count: number;
};

const CONTRIBUTION_DAYS = 14;
const LAST_DAY_INDEX = CONTRIBUTION_DAYS - 1;
const GITHUB_CONTRIBUTION_PAGE_SIZE = 100;

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
function _getDateRange(): { from: string; to: string } {
  const now = new Date();
  const toDate = getJstDateBase(now);
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(toDate.getUTCDate() - LAST_DAY_INDEX);
  return {
    from: formatDateString(fromDate),
    to: formatDateString(toDate),
  };
}

/**
 * k8oリポジトリ専用のコントリビューションデータを取得（直近2週間）
 */
export async function fetchK8oRepositoryContributions(
  username: string,
  owner: string,
  repo: string,
): Promise<ContributionDay[]> {
  const token = process.env['GITHUB_TOKEN'];

  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const octokit = new Octokit({ auth: token });

  const { from, to } = _getDateRange();

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

            const response: ContributionResponse = await octokit.graphql(
              query,
              {
                userName: username,
                from: getJstUtcStart(from),
                to: getJstUtcEnd(to),
                after: cursor,
                pageSize: GITHUB_CONTRIBUTION_PAGE_SIZE,
              },
            );

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

  const days: ContributionDay[] = [];
  const fromDate = new Date(`${from}T00:00:00Z`);

  for (let i = 0; i <= LAST_DAY_INDEX; i++) {
    const date = new Date(fromDate);
    date.setUTCDate(fromDate.getUTCDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    if (!dateStr) continue;

    const count = contributionMap.get(dateStr) || 0;

    days.push({ date: dateStr, count });
  }

  return days;
}
