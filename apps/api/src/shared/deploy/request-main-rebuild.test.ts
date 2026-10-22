import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestMainRebuild } from './request-main-rebuild';

const TOKEN = 'github_pat_TEST_0123456789abcdef';

const fetchMock = vi.fn<typeof fetch>();

const requestedInit = (): RequestInit => {
  const init = fetchMock.mock.calls[0]?.[1];
  if (init === undefined) {
    throw new Error('fetch が呼ばれていません');
  }
  return init;
};

const requestedBody = (): unknown => {
  const { body } = requestedInit();
  if (typeof body !== 'string') {
    throw new TypeError('本文が文字列ではありません');
  }
  return JSON.parse(body);
};

const loggedText = (): string =>
  JSON.stringify([
    ...vi.mocked(console.warn).mock.calls,
    ...vi.mocked(console.error).mock.calls,
  ]);

beforeEach(() => {
  vi.stubEnv('MAIN_REBUILD_GITHUB_TOKEN', TOKEN);
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('requestMainRebuild', () => {
  describe('正常系', () => {
    it('vercel-prebuilt.yml の workflow_dispatch を、main の ref と app=main・target=production で起こす', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await requestMainRebuild();

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        'https://api.github.com/repos/k35o/k8o/actions/workflows/vercel-prebuilt.yml/dispatches',
      );
      expect(requestedInit().method).toBe('POST');
      expect(requestedBody()).toStrictEqual({
        ref: 'main',
        inputs: { app: 'main', target: 'production' },
      });
    });

    it('トークンを Bearer で添え、User-Agent・Accept・API の版・本文の型を付けて頼む', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await requestMainRebuild();

      expect(
        Object.fromEntries(new Headers(requestedInit().headers)),
      ).toStrictEqual({
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${TOKEN}`,
        'content-type': 'application/json',
        'user-agent': 'api.k8o.me',
        'x-github-api-version': '2022-11-28',
      });
    });

    it('GitHub が 204 を返したら true を返す', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await expect(requestMainRebuild()).resolves.toBe(true);
    });

    it('5秒で打ち切るシグナルを fetch に渡す', async () => {
      const controller = new AbortController();
      const timeout = vi
        .spyOn(AbortSignal, 'timeout')
        .mockReturnValue(controller.signal);
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await requestMainRebuild();

      expect(timeout).toHaveBeenCalledWith(5000);
      expect(requestedInit().signal).toBe(controller.signal);
    });
  });

  describe('異常系', () => {
    it('GitHub が 401 を返したら false を返し、状態のコードだけをログに残す', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ message: 'Bad credentials' }, { status: 401 }),
      );

      await expect(requestMainRebuild()).resolves.toBe(false);

      expect(console.error).toHaveBeenCalledWith(
        'main の再ビルドを起こせませんでした: GitHub が 401 を返しました',
      );
      expect(loggedText()).not.toContain(TOKEN);
    });

    it('打ち切られたら投げずに false を返す', async () => {
      fetchMock.mockRejectedValue(
        new DOMException(
          'The operation was aborted due to timeout',
          'TimeoutError',
        ),
      );

      await expect(requestMainRebuild()).resolves.toBe(false);
    });
  });

  describe('エッジケース', () => {
    it.each([undefined, ''])(
      'トークンが %j なら、GitHub を呼ばずに false を返す',
      async (token) => {
        vi.stubEnv('MAIN_REBUILD_GITHUB_TOKEN', token);

        await expect(requestMainRebuild()).resolves.toBe(false);

        expect(fetchMock).not.toHaveBeenCalled();
      },
    );

    it.each([
      ['途中', `${TOKEN}\n${TOKEN}`],
      ['先頭', `\n${TOKEN}`],
      ['末尾', `${TOKEN}\n`],
    ])(
      'トークンの%sに改行があれば、GitHub を呼ばずに false を返し、値をログに残さない',
      async (_, token) => {
        vi.stubEnv('MAIN_REBUILD_GITHUB_TOKEN', token);

        await expect(requestMainRebuild()).resolves.toBe(false);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
          'MAIN_REBUILD_GITHUB_TOKEN に英数字と _ のほかの文字（改行など）が入っているため、main の再ビルドを起こしませんでした',
        );
        expect(loggedText()).not.toContain(TOKEN);
      },
    );
  });
});
