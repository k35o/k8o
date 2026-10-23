import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchUserContributions } from './contributions';

const TOKEN = 'github_pat_test_token';

const fetchMock = vi.fn<typeof fetch>();

const calendarResponse = (
  weeks: Array<{
    contributionDays: Array<{ date: string; contributionCount: number }>;
  }>,
): Response =>
  Response.json({
    data: {
      user: {
        contributionsCollection: { contributionCalendar: { weeks } },
      },
    },
  });

const requestOf = (
  index = 0,
): { url: unknown; init: RequestInit; variables: unknown } => {
  const [url, init = {}] = fetchMock.mock.calls[index] ?? [];
  const body = JSON.parse(init.body as string) as { variables: unknown };
  return { url, init, variables: body.variables };
};

describe('fetchUserContributions', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-27T12:00:00.000Z'));
    vi.stubEnv('GITHUB_READ_TOKEN', TOKEN);
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('日本時間の今日までの14日分を、カレンダーに無い日を0にして日付の順に返す', async () => {
      fetchMock.mockResolvedValue(
        calendarResponse([
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
          { contributionDays: [{ date: '2026-03-28', contributionCount: 99 }] },
        ]),
      );

      await expect(fetchUserContributions('k35o')).resolves.toStrictEqual([
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

    it('GitHub の GraphQL に、トークンと日本時間の14日の範囲を付けて1回だけ頼む', async () => {
      fetchMock.mockResolvedValue(calendarResponse([]));

      await fetchUserContributions('k35o');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const { url, init, variables } = requestOf();
      expect(url).toBe('https://api.github.com/graphql');
      expect(init.method).toBe('POST');
      expect(new Headers(init.headers).get('authorization')).toBe(
        `Bearer ${TOKEN}`,
      );
      expect(variables).toStrictEqual({
        userName: 'k35o',
        from: '2026-03-13T15:00:00.000Z',
        to: '2026-03-27T14:59:59.999Z',
      });
    });

    it('応答しない GitHub を待ち続けないよう、10秒で打ち切る signal を付ける', async () => {
      const timeout = vi.spyOn(AbortSignal, 'timeout');
      fetchMock.mockResolvedValue(calendarResponse([]));

      await fetchUserContributions('k35o');

      expect(timeout).toHaveBeenCalledExactlyOnceWith(10_000);
      expect(requestOf().init.signal).toBe(timeout.mock.results[0]?.value);
    });
  });

  describe('異常系', () => {
    it.each([
      ['401 を返した', () => new Response(null, { status: 401 })],
      [
        'GraphQL のエラーを返した',
        () =>
          Response.json({
            data: null,
            errors: [
              { message: 'Resource not accessible by personal access token' },
            ],
          }),
      ],
      ['data の無い応答を返した', () => Response.json({})],
      ['JSON でない応答を返した', () => new Response('<html></html>')],
    ])('GitHub が%sら null を返す', async (_, response) => {
      fetchMock.mockResolvedValue(response());

      await expect(fetchUserContributions('k35o')).resolves.toBeNull();
    });

    it('GitHub に届かなければ null を返す', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'));

      await expect(fetchUserContributions('k35o')).resolves.toBeNull();
    });

    it('トークンが未設定なら、GitHub を呼ばずに投げる', async () => {
      vi.stubEnv('GITHUB_READ_TOKEN', '');

      await expect(fetchUserContributions('k35o')).rejects.toThrow(
        'GITHUB_READ_TOKEN が設定されていません',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('トークンに改行が入っていれば、値を入れない文で投げ、GitHub を呼ばない', async () => {
      vi.stubEnv('GITHUB_READ_TOKEN', `${TOKEN}\n`);

      const error = await fetchUserContributions('k35o').catch(
        (thrown: unknown) => thrown,
      );

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'GITHUB_READ_TOKEN に英数字と _ のほかの文字（改行など）が入っています',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('カレンダーが空なら、14日すべてを0で返す', async () => {
      fetchMock.mockResolvedValue(calendarResponse([]));

      const days = await fetchUserContributions('k35o');

      expect(days).toHaveLength(14);
      expect(days?.every((day) => day.count === 0)).toBe(true);
    });

    it.each([
      [
        '日本時間の 23:59:59.999 は、その日を最後の日にする',
        '2026-03-27T14:59:59.999Z',
        { from: '2026-03-13T15:00:00.000Z', to: '2026-03-27T14:59:59.999Z' },
      ],
      [
        '日本時間の 0:00 になったら、次の日を最後の日にする',
        '2026-03-27T15:00:00.000Z',
        { from: '2026-03-14T15:00:00.000Z', to: '2026-03-28T14:59:59.999Z' },
      ],
    ])('%s', async (_, now, range) => {
      vi.setSystemTime(new Date(now));
      fetchMock.mockResolvedValue(calendarResponse([]));

      await fetchUserContributions('k35o');

      expect(requestOf().variables).toStrictEqual({
        userName: 'k35o',
        ...range,
      });
    });
  });
});
