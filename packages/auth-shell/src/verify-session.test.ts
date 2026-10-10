import { verifySession } from './verify-session';

const { connection, getSession } = vi.hoisted(() => ({
  connection: vi.fn<() => Promise<void>>(),
  getSession: vi.fn<() => Promise<{ user: { email: string } } | null>>(),
}));

vi.mock('server-only', () => ({}));
vi.mock('next/server', () => ({ connection }));
vi.mock('next/headers', () => ({
  headers: (): Promise<Headers> => Promise.resolve(new Headers()),
}));
vi.mock('@repo/database/auth', () => ({
  auth: { api: { getSession } },
  isAllowedEmail: (email: string): boolean => email === 'allowed@example.com',
}));
vi.mock('./auth-enabled', () => ({ isAuthEnabled: true }));

const flushMicrotasks = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe('verifySession', () => {
  beforeEach(() => {
    connection.mockReset();
    getSession.mockReset();
  });

  describe('正常系', () => {
    it('実際のリクエストになるまでセッションを読まない', async () => {
      // プリレンダー中の connection() は解決しない
      connection.mockReturnValue(new Promise(() => {}));

      void verifySession();
      await flushMicrotasks();

      expect(getSession).not.toHaveBeenCalled();
    });

    it('実際のリクエストでは許可されたセッションを通す', async () => {
      connection.mockResolvedValue();
      getSession.mockResolvedValue({ user: { email: 'allowed@example.com' } });

      await expect(verifySession()).resolves.toBeUndefined();
      expect(getSession).toHaveBeenCalledOnce();
    });
  });
});
