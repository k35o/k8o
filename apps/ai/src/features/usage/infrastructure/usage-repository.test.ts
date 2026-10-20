import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';

import { db } from '@repo/ai-database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
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
  kind?: string;
  userId: string;
  createdAt: string;
  costMicroUsd?: number | null;
}): void => {
  sqlite
    .prepare(
      'insert into ai_usages (app, user_id, kind, created_at, cost_micro_usd) values (?, ?, ?, ?, ?)',
    )
    .run(
      row.app,
      row.userId,
      row.kind ?? 'generation',
      row.createdAt,
      row.costMicroUsd ?? null,
    );
};

// node:sqlite の行はプロトタイプを持たないので、比べられるよう普通のオブジェクトに写す
const selectRows = (): unknown[] =>
  structuredClone(
    sqlite
      .prepare(
        'select id, app, user_id, kind, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_micro_usd, created_at from ai_usages order by id',
      )
      .all(),
  );

const base = {
  app: 'agent',
  kind: 'generation',
  userId: 'u1',
  model: 'claude-sonnet-5-5',
  createdAt: '2026-10-13T12:00:00.000Z',
  sinceIso: '2026-10-13T11:00:00.000Z',
  limit: 2,
  monthStartIso: '2026-10-01T00:00:00.000Z',
  budgetMicroUsd: 1000,
} as const;

// 1時間のウィンドウより前で、当月に入る時刻。予算だけに数えたい行に使う
const EARLIER_THIS_MONTH = '2026-10-02T00:00:00.000Z';

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
      created_at text not null,
      model text,
      cache_read_tokens integer,
      cache_write_tokens integer,
      cost_micro_usd integer
    )
  `);
});

describe('insertUsageWithinLimits', () => {
  describe('正常系', () => {
    it('上限と予算に収まれば、種類とモデルだけを入れた利用の行を入れてその id を返す', async () => {
      const id = await insertUsageWithinLimits({ ...base, kind: 'ui' });

      expect(id).toBe(1);
      expect(selectRows()).toStrictEqual([
        {
          id: 1,
          app: 'agent',
          user_id: 'u1',
          kind: 'ui',
          model: 'claude-sonnet-5-5',
          input_tokens: null,
          output_tokens: null,
          cache_read_tokens: null,
          cache_write_tokens: null,
          cost_micro_usd: null,
          created_at: '2026-10-13T12:00:00.000Z',
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('上限ちょうどに達していると、行を入れずに null を返す', async () => {
      await expect(insertUsageWithinLimits(base)).resolves.toBe(1);
      await expect(insertUsageWithinLimits(base)).resolves.toBe(2);

      await expect(insertUsageWithinLimits(base)).resolves.toBeNull();
      expect(selectRows()).toHaveLength(2);
    });

    it('当月の費用の合計が予算ちょうどに達していると、行を入れずに null を返す', async () => {
      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: 600,
      });
      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: 400,
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBeNull();
      expect(selectRows()).toHaveLength(2);
    });
  });

  describe('エッジケース', () => {
    it('ウィンドウの開始時刻ちょうどの行は数え、それより前の行は数えない', async () => {
      insertRow({ app: 'agent', userId: 'u1', createdAt: base.sinceIso });
      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: '2026-10-13T10:59:59.999Z',
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBe(3);
      await expect(insertUsageWithinLimits(base)).resolves.toBeNull();
    });

    it('tool の生成の行（kind: ui）も、会話の行と同じ1時間の上限に数える', async () => {
      insertRow({
        app: 'agent',
        kind: 'ui',
        userId: 'u1',
        createdAt: base.createdAt,
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBe(2);
      await expect(insertUsageWithinLimits(base)).resolves.toBeNull();
    });

    it('app が agent でない行と、ほかの利用者の行は数えない', async () => {
      insertRow({ app: 'ui-studio', userId: 'u1', createdAt: base.createdAt });
      insertRow({ app: 'slides', userId: 'u1', createdAt: base.createdAt });
      insertRow({ app: 'agent', userId: 'u2', createdAt: base.createdAt });
      insertRow({ app: 'agent', userId: 'u2', createdAt: base.createdAt });

      await expect(insertUsageWithinLimits(base)).resolves.toBe(5);
    });

    it('同時に来た要求でも、上限を超えて予約しない', async () => {
      const ids = await Promise.all([
        insertUsageWithinLimits({ ...base, limit: 1 }),
        insertUsageWithinLimits({ ...base, limit: 1 }),
      ]);

      expect(ids.filter((id) => id !== null)).toHaveLength(1);
      expect(selectRows()).toHaveLength(1);
    });

    it('予算まで1マイクロドルでも残っていれば予約する', async () => {
      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: 999,
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBe(2);
    });

    it('月初ちょうどの行の費用は予算に数え、それより前の行の費用は数えない', async () => {
      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: '2026-09-30T23:59:59.999Z',
        costMicroUsd: 5000,
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBe(2);

      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: base.monthStartIso,
        costMicroUsd: 1000,
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBeNull();
    });

    it('app が agent でない行と、ほかの利用者の費用も予算に数える', async () => {
      insertRow({
        app: 'slides',
        userId: 'u1',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: 500,
      });
      insertRow({
        app: 'agent',
        userId: 'u2',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: 500,
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBeNull();
    });

    it('費用が null の行（予約したばかりの行や、費用の列を足す前の行）は0円として数える', async () => {
      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: null,
      });
      insertRow({
        app: 'agent',
        userId: 'u1',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: 999,
      });

      await expect(insertUsageWithinLimits(base)).resolves.toBe(3);
    });
  });
});

describe('selectCostSinceMicroUsd', () => {
  describe('正常系', () => {
    it('指定した時刻以降の全行の費用を足し合わせ、null の行は0円として数える', async () => {
      insertRow({
        app: 'ui-studio',
        userId: 'u1',
        createdAt: '2026-09-30T23:59:59.999Z',
        costMicroUsd: 5000,
      });
      insertRow({
        app: 'ui-studio',
        userId: 'u1',
        createdAt: base.monthStartIso,
        costMicroUsd: 300,
      });
      insertRow({
        app: 'agent',
        userId: 'u2',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: 200,
      });
      insertRow({
        app: 'slides',
        userId: 'u1',
        createdAt: EARLIER_THIS_MONTH,
        costMicroUsd: null,
      });

      await expect(selectCostSinceMicroUsd(base.monthStartIso)).resolves.toBe(
        500,
      );
    });
  });

  describe('エッジケース', () => {
    it('行が無ければ 0 を返す', async () => {
      await expect(selectCostSinceMicroUsd(base.monthStartIso)).resolves.toBe(
        0,
      );
    });
  });
});

describe('updateUsageCost', () => {
  describe('正常系', () => {
    it('予約した行だけに、トークン数の内訳と費用を書き込む', async () => {
      await insertUsageWithinLimits(base);
      await insertUsageWithinLimits(base);

      await updateUsageCost({
        id: 1,
        inputTokens: 1200,
        outputTokens: 300,
        cacheReadTokens: 800,
        cacheWriteTokens: 100,
        costMicroUsd: 4210,
      });

      expect(selectRows()).toMatchObject([
        {
          id: 1,
          model: 'claude-sonnet-5-5',
          input_tokens: 1200,
          output_tokens: 300,
          cache_read_tokens: 800,
          cache_write_tokens: 100,
          cost_micro_usd: 4210,
        },
        {
          id: 2,
          input_tokens: null,
          output_tokens: null,
          cache_read_tokens: null,
          cache_write_tokens: null,
          cost_micro_usd: null,
        },
      ]);
    });
  });
});
