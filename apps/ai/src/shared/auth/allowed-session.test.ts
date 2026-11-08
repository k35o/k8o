import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAllowedSession } from './allowed-session';

const { authEnabled, getSession } = vi.hoisted(() => ({
  authEnabled: { value: true },
  getSession:
    vi.fn<() => Promise<{ user: { id: string; email: string } } | null>>(),
}));

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  headers: (): Promise<Headers> => Promise.resolve(new Headers()),
}));
vi.mock('@repo/ai-database/auth', () => ({
  auth: { api: { getSession } },
  isAllowedEmail: (email: string): boolean => email === 'allowed@example.com',
}));
vi.mock('./auth-enabled', () => ({
  get isAuthEnabled(): boolean {
    return authEnabled.value;
  },
}));

describe('getAllowedSession', () => {
  beforeEach(() => {
    authEnabled.value = true;
    getSession.mockReset();
  });

  describe('正常系', () => {
    it('許可されたメールのセッションなら利用者の id を返す', async () => {
      getSession.mockResolvedValue({
        user: { id: 'u1', email: 'allowed@example.com' },
      });

      await expect(getAllowedSession()).resolves.toStrictEqual({
        userId: 'u1',
      });
    });
  });

  describe('異常系', () => {
    it('セッションが無ければ null を返す', async () => {
      getSession.mockResolvedValue(null);

      await expect(getAllowedSession()).resolves.toBeNull();
    });

    it('許可リストから外れたメールのセッションは null を返す', async () => {
      getSession.mockResolvedValue({
        user: { id: 'u2', email: 'removed@example.com' },
      });

      await expect(getAllowedSession()).resolves.toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('認証が無効ならセッションを読まずに local の利用者にする', async () => {
      authEnabled.value = false;

      await expect(getAllowedSession()).resolves.toStrictEqual({
        userId: 'local',
      });
      expect(getSession).not.toHaveBeenCalled();
    });
  });
});
