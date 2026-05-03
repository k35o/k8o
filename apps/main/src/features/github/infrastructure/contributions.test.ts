import { fetchUserContributions } from './contributions';

const graphqlMock = vi.fn();

vi.mock('octokit', () => ({
  Octokit: vi.fn(function MockOctokit() {
    return {
      graphql: graphqlMock,
    };
  }),
}));

describe('fetchUserContributions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-27T12:00:00.000Z'));
    vi.stubEnv('GITHUB_TOKEN', 'test-token');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('GITHUB_TOKENが未設定の場合はエラーを投げる', async () => {
    vi.stubEnv('GITHUB_TOKEN', undefined);

    await expect(fetchUserContributions('k35o')).rejects.toThrow(
      'GITHUB_TOKEN is not configured',
    );
  });

  it('カレンダーが空の場合は直近14日分を0件で返す', async () => {
    graphqlMock.mockResolvedValue({
      user: {
        contributionsCollection: {
          contributionCalendar: {
            weeks: [],
          },
        },
      },
    });

    await expect(fetchUserContributions('k35o')).resolves.toEqual([
      { date: '2026-03-14', count: 0 },
      { date: '2026-03-15', count: 0 },
      { date: '2026-03-16', count: 0 },
      { date: '2026-03-17', count: 0 },
      { date: '2026-03-18', count: 0 },
      { date: '2026-03-19', count: 0 },
      { date: '2026-03-20', count: 0 },
      { date: '2026-03-21', count: 0 },
      { date: '2026-03-22', count: 0 },
      { date: '2026-03-23', count: 0 },
      { date: '2026-03-24', count: 0 },
      { date: '2026-03-25', count: 0 },
      { date: '2026-03-26', count: 0 },
      { date: '2026-03-27', count: 0 },
    ]);

    expect(graphqlMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userName: 'k35o',
        from: '2026-03-13T15:00:00.000Z',
        to: '2026-03-27T14:59:59.999Z',
      }),
    );
  });

  it('カレンダーの日次コントリビューションを期間内で集計する', async () => {
    graphqlMock.mockResolvedValue({
      user: {
        contributionsCollection: {
          contributionCalendar: {
            weeks: [
              {
                contributionDays: [
                  { date: '2026-03-14', contributionCount: 0 },
                  { date: '2026-03-15', contributionCount: 2 },
                ],
              },
              {
                contributionDays: [
                  { date: '2026-03-20', contributionCount: 3 },
                  { date: '2026-03-21', contributionCount: 4 },
                ],
              },
              {
                // 期間外の日付は無視される
                contributionDays: [
                  { date: '2026-03-28', contributionCount: 99 },
                ],
              },
            ],
          },
        },
      },
    });

    const result = await fetchUserContributions('k35o');

    expect(graphqlMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { date: '2026-03-14', count: 0 },
      { date: '2026-03-15', count: 2 },
      { date: '2026-03-16', count: 0 },
      { date: '2026-03-17', count: 0 },
      { date: '2026-03-18', count: 0 },
      { date: '2026-03-19', count: 0 },
      { date: '2026-03-20', count: 3 },
      { date: '2026-03-21', count: 4 },
      { date: '2026-03-22', count: 0 },
      { date: '2026-03-23', count: 0 },
      { date: '2026-03-24', count: 0 },
      { date: '2026-03-25', count: 0 },
      { date: '2026-03-26', count: 0 },
      { date: '2026-03-27', count: 0 },
    ]);
  });
});
