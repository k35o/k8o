import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';

import { db } from '@repo/ai-database';

import {
  reserveGenerationUsage,
  updateGenerationUsageTokens,
} from './usage-repository';

vi.mock('server-only', () => ({}));

// 接続はしないが、db を作るときに URL の形式が検査される
vi.hoisted(() => {
  vi.stubEnv('AI_TURSO_DATABASE_URL', 'http://localhost');
});

// libsql の代わりに、ai_usages だけを持つインメモリの SQLite で SQL を実行する
let sqlite: DatabaseSync;

vi.spyOn(db.$client, 'execute').mockImplementation((statement) => {
  const { sql, args } = statement as unknown as {
    sql: string;
    args: SQLInputValue[];
  };
  const prepared = sqlite.prepare(sql);
  prepared.setReturnArrays(true);
  return Promise.resolve({ rows: prepared.all(...args) } as never);
});

const insertRow = (row: {
  app: string;
  userId: string;
  createdAt: string;
}): void => {
  sqlite
    .prepare(
      "insert into ai_usages (app, user_id, kind, created_at) values (?, ?, 'generation', ?)",
    )
    .run(row.app, row.userId, row.createdAt);
};

// node:sqlite の行はプロトタイプを持たないので、比べられるよう普通のオブジェクトに写す
const selectRows = (): unknown[] =>
  structuredClone(
    sqlite
      .prepare(
        'select id, app, user_id, kind, input_tokens, output_tokens, created_at from ai_usages order by id',
      )
      .all(),
  );

const base = {
  app: 'ui-studio',
  userId: 'u1',
  createdAt: '2026-10-13T12:00:00.000Z',
  sinceIso: '2026-10-13T11:00:00.000Z',
  limit: 2,
} as const;

beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    create table ai_usages (
      id integer primary key autoincrement not null,
      app text not null,
      user_id text not null,
      kind text not null,
      input_tokens integer,
      output_tokens integer,
      created_at text not null
    )
  `);
});

describe('reserveGenerationUsage', () => {
  describe('正常系', () => {
    it('上限未満なら、トークン数が空の利用の行を入れてその id を返す', async () => {
      const id = await reserveGenerationUsage(base);

      expect(id).toBe(1);
      expect(selectRows()).toStrictEqual([
        {
          id: 1,
          app: 'ui-studio',
          user_id: 'u1',
          kind: 'generation',
          input_tokens: null,
          output_tokens: null,
          created_at: '2026-10-13T12:00:00.000Z',
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('上限ちょうどに達していると、行を入れずに null を返す', async () => {
      await expect(reserveGenerationUsage(base)).resolves.toBe(1);
      await expect(reserveGenerationUsage(base)).resolves.toBe(2);

      await expect(reserveGenerationUsage(base)).resolves.toBeNull();
      expect(selectRows()).toHaveLength(2);
    });
  });

  describe('エッジケース', () => {
    it('ウィンドウの開始時刻ちょうどの行は数え、それより前の行は数えない', async () => {
      insertRow({ app: 'ui-studio', userId: 'u1', createdAt: base.sinceIso });
      insertRow({
        app: 'ui-studio',
        userId: 'u1',
        createdAt: '2026-10-13T10:59:59.999Z',
      });

      await expect(reserveGenerationUsage(base)).resolves.toBe(3);
      await expect(reserveGenerationUsage(base)).resolves.toBeNull();
    });

    it('ほかのアプリやほかの利用者の行は数えない', async () => {
      insertRow({ app: 'slides', userId: 'u1', createdAt: base.createdAt });
      insertRow({ app: 'slides', userId: 'u1', createdAt: base.createdAt });
      insertRow({ app: 'ui-studio', userId: 'u2', createdAt: base.createdAt });
      insertRow({ app: 'ui-studio', userId: 'u2', createdAt: base.createdAt });

      await expect(reserveGenerationUsage(base)).resolves.toBe(5);
    });

    it('同時に来た要求でも、上限を超えて予約しない', async () => {
      const ids = await Promise.all([
        reserveGenerationUsage({ ...base, limit: 1 }),
        reserveGenerationUsage({ ...base, limit: 1 }),
      ]);

      expect(ids.filter((id) => id !== null)).toHaveLength(1);
      expect(selectRows()).toHaveLength(1);
    });
  });
});

describe('updateGenerationUsageTokens', () => {
  describe('正常系', () => {
    it('予約した行だけにトークン数を書き込む', async () => {
      await reserveGenerationUsage(base);
      await reserveGenerationUsage(base);

      await updateGenerationUsageTokens({
        id: 1,
        inputTokens: 120,
        outputTokens: 30,
      });

      expect(selectRows()).toMatchObject([
        { id: 1, input_tokens: 120, output_tokens: 30 },
        { id: 2, input_tokens: null, output_tokens: null },
      ]);
    });
  });
});
