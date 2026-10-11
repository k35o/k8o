import { format } from 'node:util';

import { DrizzleQueryError } from 'drizzle-orm';

import { logAuthEvent } from './auth-logger';

const query = 'select "id" from "session" where "session"."token" = ?';
const token = 'session-token-value';

// console は引数を util.format で整形して出力する
const printedBy = (spy: { mock: { calls: unknown[][] } }): string =>
  format(...spy.mock.calls.flat());

const findSession = (): DrizzleQueryError =>
  new DrizzleQueryError(query, [token], new Error('fetch failed'));

describe('logAuthEvent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('クエリの失敗を、バインド値を除いたSQLと原因で出力する', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      logAuthEvent('error', 'INTERNAL_SERVER_ERROR', findSession());

      const printed = printedBy(error);
      expect(printed).not.toContain(token);
      expect(printed).toContain('[Better Auth]: INTERNAL_SERVER_ERROR');
      expect(printed).toContain(`Failed query: ${query}`);
      expect(printed).toContain('fetch failed');
    });

    it('クエリを発行した呼び出し元のスタックを残す', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      logAuthEvent('error', 'INTERNAL_SERVER_ERROR', findSession());

      expect(printedBy(error)).toContain('at findSession');
    });

    it('メッセージに埋め込まれたクエリの失敗からもバインド値を除く', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      logAuthEvent('error', findSession().message);

      const printed = printedBy(error);
      expect(printed).not.toContain(token);
      expect(printed).toContain(`Failed query: ${query}`);
    });

    it('レベルに対応するconsoleのメソッドで出力する', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logAuthEvent('warn', 'Rate limit exceeded');

      expect(printedBy(warn)).toBe('[Better Auth]: Rate limit exceeded');
    });
  });
});
