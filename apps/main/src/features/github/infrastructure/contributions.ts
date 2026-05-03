import { Octokit } from 'octokit';

import {
  formatDateString,
  getJstDateBase,
  getJstUtcEnd,
  getJstUtcStart,
} from './jst';

type ContributionDay = {
  date: string;
  count: number;
};

const CONTRIBUTION_DAYS = 14;
const LAST_DAY_INDEX = CONTRIBUTION_DAYS - 1;

type ContributionCalendarResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: Array<{
          contributionDays: Array<{
            date: string;
            contributionCount: number;
          }>;
        }>;
      };
    };
  };
};

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
 * ユーザーのコントリビューション（commit / PR / issue / review）を直近2週間分取得
 */
export async function fetchUserContributions(
  username: string,
): Promise<ContributionDay[]> {
  const token = process.env['GITHUB_TOKEN'];

  if (token === undefined || token === '') {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const octokit = new Octokit({ auth: token });

  const { from, to } = _getDateRange();

  const query = `
    query($userName:String!, $from:DateTime!, $to:DateTime!) {
      user(login: $userName) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response: ContributionCalendarResponse = await octokit.graphql(query, {
    userName: username,
    from: getJstUtcStart(from),
    to: getJstUtcEnd(to),
  });

  const contributionMap = new Map<string, number>();
  for (const week of response.user.contributionsCollection.contributionCalendar
    .weeks) {
    for (const day of week.contributionDays) {
      contributionMap.set(day.date, day.contributionCount);
    }
  }

  const days: ContributionDay[] = [];
  const fromDate = new Date(`${from}T00:00:00Z`);

  for (let i = 0; i <= LAST_DAY_INDEX; i++) {
    const date = new Date(fromDate);
    date.setUTCDate(fromDate.getUTCDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    if (dateStr === undefined) continue;

    const count = contributionMap.get(dateStr) ?? 0;

    days.push({ date: dateStr, count });
  }

  return days;
}
