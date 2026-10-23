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

type ContributionWeeks = Array<{
  contributionDays: Array<{
    date: string;
    contributionCount: number;
  }>;
}>;

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const FETCH_TIMEOUT_MS = 10_000;
const CONTRIBUTION_DAYS = 14;
const LAST_DAY_INDEX = CONTRIBUTION_DAYS - 1;

const CONTRIBUTIONS_QUERY = `
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

const githubReadToken = (): string => {
  const token = process.env['GITHUB_READ_TOKEN'];
  if (token === undefined || token === '') {
    throw new Error('GITHUB_READ_TOKEN が設定されていません');
  }
  // 改行などヘッダーに使えない文字があると、fetch が投げる TypeError の文にトークンが
  // まるごと入ってログに残るので、GitHub を呼ぶ前に値を入れない文で弾く
  if (!/^[A-Za-z0-9_]+$/u.test(token)) {
    throw new Error(
      'GITHUB_READ_TOKEN に英数字と _ のほかの文字（改行など）が入っています',
    );
  }
  return token;
};

function getDateRange(): { from: string; to: string } {
  const toDate = getJstDateBase(new Date());
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(toDate.getUTCDate() - LAST_DAY_INDEX);
  return {
    from: formatDateString(fromDate),
    to: formatDateString(toDate),
  };
}

async function fetchContributionWeeks(
  token: string,
  username: string,
  { from, to }: { from: string; to: string },
): Promise<ContributionWeeks> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'api.k8o.me',
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        userName: username,
        from: getJstUtcStart(from),
        to: getJstUtcEnd(to),
      },
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `GitHub の GraphQL が ${String(response.status)} を返しました`,
    );
  }

  const payload = (await response.json()) as {
    data?: {
      user: {
        contributionsCollection: {
          contributionCalendar: { weeks: ContributionWeeks };
        };
      };
    } | null;
    errors?: Array<{ message: string }>;
  };
  if (payload.errors !== undefined && payload.errors.length > 0) {
    throw new Error(
      `GitHub の GraphQL がエラーを返しました: ${payload.errors[0]?.message ?? 'unknown'}`,
    );
  }
  if (payload.data === undefined || payload.data === null) {
    throw new Error('GitHub の GraphQL の応答に data がありません');
  }
  return payload.data.user.contributionsCollection.contributionCalendar.weeks;
}

export async function fetchUserContributions(
  username: string,
): Promise<ContributionDay[] | null> {
  const token = githubReadToken();
  const range = getDateRange();

  let weeks: ContributionWeeks;
  try {
    weeks = await fetchContributionWeeks(token, username, range);
  } catch (error) {
    console.error('GitHub から草を取れませんでした:', error);
    return null;
  }

  const contributionMap = new Map<string, number>();
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      contributionMap.set(day.date, day.contributionCount);
    }
  }

  const days: ContributionDay[] = [];
  const fromDate = new Date(`${range.from}T00:00:00Z`);
  for (let i = 0; i <= LAST_DAY_INDEX; i++) {
    const date = new Date(fromDate);
    date.setUTCDate(fromDate.getUTCDate() + i);
    const dateStr = formatDateString(date);
    days.push({ date: dateStr, count: contributionMap.get(dateStr) ?? 0 });
  }
  return days;
}
