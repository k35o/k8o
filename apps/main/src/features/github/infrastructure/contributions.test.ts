import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRepositoryCommitContributions } from './contributions';

const graphqlMock = vi.fn();

vi.mock('octokit', () => ({
  Octokit: vi.fn(function MockOctokit() {
    return {
      graphql: graphqlMock,
    };
  }),
}));

describe('fetchRepositoryCommitContributions', () => {
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

    await expect(
      fetchRepositoryCommitContributions('k35o', 'k35o', 'k8o'),
    ).rejects.toThrow('GITHUB_TOKEN is not configured');
  });

  it('対象リポジトリが見つからない場合は直近14日分を0件で返す', async () => {
    graphqlMock.mockResolvedValue({
      user: {
        contributionsCollection: {
          commitContributionsByRepository: [],
        },
      },
    });

    await expect(
      fetchRepositoryCommitContributions('k35o', 'k35o', 'k8o'),
    ).resolves.toEqual([
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
        after: null,
        pageSize: 100,
      }),
    );
  });

  it('ページングしながら対象リポジトリのコミット数を日付ごとに集計する', async () => {
    graphqlMock
      .mockResolvedValueOnce({
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              {
                repository: {
                  owner: {
                    login: 'k35o',
                  },
                  name: 'k8o',
                },
                contributions: {
                  pageInfo: {
                    hasNextPage: true,
                    endCursor: 'cursor-1',
                  },
                  nodes: [
                    {
                      occurredAt: '2026-03-20T10:00:00.000Z',
                      commitCount: 2,
                    },
                    {
                      occurredAt: '2026-03-20T23:00:00.000Z',
                      commitCount: 1,
                    },
                  ],
                },
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              {
                repository: {
                  owner: {
                    login: 'k35o',
                  },
                  name: 'k8o',
                },
                contributions: {
                  pageInfo: {
                    hasNextPage: false,
                    endCursor: null,
                  },
                  nodes: [
                    {
                      occurredAt: '2026-03-21T00:30:00.000Z',
                      commitCount: 4,
                    },
                  ],
                },
              },
            ],
          },
        },
      });

    const result = await fetchRepositoryCommitContributions(
      'k35o',
      'k35o',
      'k8o',
    );

    expect(graphqlMock).toHaveBeenCalledTimes(2);
    expect(graphqlMock).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        after: null,
      }),
    );
    expect(graphqlMock).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        after: 'cursor-1',
      }),
    );
    expect(result).toEqual([
      { date: '2026-03-14', count: 0 },
      { date: '2026-03-15', count: 0 },
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
