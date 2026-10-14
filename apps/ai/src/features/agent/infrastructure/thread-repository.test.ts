import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';

import { db } from '@repo/ai-database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  claimThreadRun,
  insertThreadMessage,
  insertThreadWithRun,
  markStopRequested,
  releaseThreadRun,
  selectThread,
  selectThreadMessages,
  selectThreadsByUser,
  touchRunHeartbeat,
  updateLastInputTokens,
} from './thread-repository';

vi.mock('server-only', () => ({}));

// 接続はしないが、db を作るときに URL の形式が検査される
vi.hoisted(() => {
  vi.stubEnv('AI_TURSO_DATABASE_URL', 'http://localhost');
});

// libsql の代わりに、ai_threads と ai_thread_messages だけを持つインメモリの SQLite で SQL を実行する
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

const THREAD_ID = '0b9c6f3e-5a4e-4f7a-9d0e-2f6b1c3a8e71';
const STARTED_AT = '2026-10-14T12:00:00.000Z';
// STARTED_AT から 30 秒より前に生存の印が止まっていれば、落ちた実行とみなす
const STALE_BEFORE = '2026-10-14T11:59:30.000Z';

const insertThread = (row: {
  id?: string;
  userId?: string;
  runId?: string | null;
  runHeartbeatAt?: string | null;
  stopRequestedAt?: string | null;
  updatedAt?: string;
}): void => {
  sqlite
    .prepare(
      "insert into ai_threads (id, user_id, title, model, run_id, run_heartbeat_at, stop_requested_at, created_at, updated_at) values (?, ?, 'タイトル', 'claude-sonnet-5-5', ?, ?, ?, '2026-10-01T00:00:00.000Z', ?)",
    )
    .run(
      row.id ?? THREAD_ID,
      row.userId ?? 'u1',
      row.runId ?? null,
      row.runHeartbeatAt ?? null,
      row.stopRequestedAt ?? null,
      row.updatedAt ?? '2026-10-01T00:00:00.000Z',
    );
};

// node:sqlite の行はプロトタイプを持たないので、比べられるよう普通のオブジェクトに写す
const selectRunState = (id = THREAD_ID): unknown =>
  structuredClone(
    sqlite
      .prepare(
        'select run_id, run_heartbeat_at, stop_requested_at from ai_threads where id = ?',
      )
      .get(id),
  );

const claim = (input: { runId: string; userId?: string }): Promise<boolean> =>
  claimThreadRun({
    threadId: THREAD_ID,
    userId: input.userId ?? 'u1',
    runId: input.runId,
    heartbeatAt: STARTED_AT,
    staleBeforeIso: STALE_BEFORE,
  });

beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    create table ai_threads (
      id text primary key not null,
      user_id text not null,
      title text not null,
      model text not null,
      run_id text,
      run_heartbeat_at text,
      stop_requested_at text,
      last_input_tokens integer,
      created_at text not null,
      updated_at text not null
    );
    create table ai_thread_messages (
      id integer primary key autoincrement not null,
      thread_id text not null,
      message text not null,
      created_at text not null
    );
  `);
});

describe('insertThreadWithRun', () => {
  const input = {
    id: THREAD_ID,
    userId: 'u1',
    title: '記事の要約',
    model: 'claude-opus-5-5',
    runId: 'run-1',
    heartbeatAt: STARTED_AT,
  };

  describe('正常系', () => {
    it('スレッドを実行中として作り、true を返す', async () => {
      await expect(insertThreadWithRun(input)).resolves.toBe(true);

      await expect(selectThread(THREAD_ID)).resolves.toMatchObject({
        id: THREAD_ID,
        userId: 'u1',
        title: '記事の要約',
        model: 'claude-opus-5-5',
        runId: 'run-1',
        runHeartbeatAt: STARTED_AT,
        lastInputTokens: null,
      });
    });
  });

  describe('異常系', () => {
    it('同じ ID のスレッドがあれば、行を変えずに false を返す', async () => {
      insertThread({ userId: 'u2' });

      await expect(insertThreadWithRun(input)).resolves.toBe(false);
      await expect(selectThread(THREAD_ID)).resolves.toMatchObject({
        userId: 'u2',
        runId: null,
      });
    });
  });
});

describe('claimThreadRun', () => {
  describe('正常系', () => {
    it('実行中でないスレッドに実行中の印を付け、前の停止の要求を消す', async () => {
      insertThread({ stopRequestedAt: '2026-10-14T11:00:00.000Z' });

      await expect(claim({ runId: 'run-2' })).resolves.toBe(true);
      expect(selectRunState()).toStrictEqual({
        run_id: 'run-2',
        run_heartbeat_at: STARTED_AT,
        stop_requested_at: null,
      });
    });

    it('生存の印が 30 秒より前に止まった実行は、落ちたとみなして取り直す', async () => {
      insertThread({
        runId: 'run-1',
        runHeartbeatAt: '2026-10-14T11:59:29.999Z',
      });

      await expect(claim({ runId: 'run-2' })).resolves.toBe(true);
      expect(selectRunState()).toMatchObject({ run_id: 'run-2' });
    });
  });

  describe('異常系', () => {
    it('生存の印が 30 秒以内の実行中のスレッドは取れない', async () => {
      insertThread({ runId: 'run-1', runHeartbeatAt: STALE_BEFORE });

      await expect(claim({ runId: 'run-2' })).resolves.toBe(false);
      expect(selectRunState()).toMatchObject({ run_id: 'run-1' });
    });

    it('ほかの利用者のスレッドは取れない', async () => {
      insertThread({ userId: 'u2' });

      await expect(claim({ runId: 'run-2' })).resolves.toBe(false);
      expect(selectRunState()).toMatchObject({ run_id: null });
    });
  });

  describe('エッジケース', () => {
    it('2つの要求が同時に来ても、取れるのは片方だけ', async () => {
      insertThread({});

      const results = await Promise.all([
        claim({ runId: 'run-a' }),
        claim({ runId: 'run-b' }),
      ]);

      expect(results.filter(Boolean)).toHaveLength(1);
    });
  });
});

describe('touchRunHeartbeat', () => {
  describe('正常系', () => {
    it('自分の実行なら生存の印を更新し、停止の要求が無いことを返す', async () => {
      insertThread({ runId: 'run-1', runHeartbeatAt: STALE_BEFORE });

      await expect(
        touchRunHeartbeat({
          threadId: THREAD_ID,
          runId: 'run-1',
          heartbeatAt: STARTED_AT,
        }),
      ).resolves.toStrictEqual({ stopRequested: false });
      expect(selectRunState()).toMatchObject({ run_heartbeat_at: STARTED_AT });
    });

    it('停止が要求されていれば、それを返す', async () => {
      insertThread({
        runId: 'run-1',
        stopRequestedAt: '2026-10-14T11:59:59.000Z',
      });

      await expect(
        touchRunHeartbeat({
          threadId: THREAD_ID,
          runId: 'run-1',
          heartbeatAt: STARTED_AT,
        }),
      ).resolves.toStrictEqual({ stopRequested: true });
    });
  });

  describe('異常系', () => {
    it('印がほかの実行に移っていれば、更新せずに null を返す', async () => {
      insertThread({ runId: 'run-2', runHeartbeatAt: STALE_BEFORE });

      await expect(
        touchRunHeartbeat({
          threadId: THREAD_ID,
          runId: 'run-1',
          heartbeatAt: STARTED_AT,
        }),
      ).resolves.toBeNull();
      expect(selectRunState()).toMatchObject({
        run_heartbeat_at: STALE_BEFORE,
      });
    });
  });
});

describe('releaseThreadRun', () => {
  describe('正常系', () => {
    it('自分の実行の印と停止の要求を消す', async () => {
      insertThread({
        runId: 'run-1',
        runHeartbeatAt: STARTED_AT,
        stopRequestedAt: STARTED_AT,
      });

      await releaseThreadRun({ threadId: THREAD_ID, runId: 'run-1' });

      expect(selectRunState()).toStrictEqual({
        run_id: null,
        run_heartbeat_at: null,
        stop_requested_at: null,
      });
    });
  });

  describe('異常系', () => {
    it('ほかの実行の印は消さない', async () => {
      insertThread({ runId: 'run-2', runHeartbeatAt: STARTED_AT });

      await releaseThreadRun({ threadId: THREAD_ID, runId: 'run-1' });

      expect(selectRunState()).toMatchObject({ run_id: 'run-2' });
    });
  });
});

describe('markStopRequested', () => {
  describe('正常系', () => {
    it('実行中の自分のスレッドに停止の要求を書く', async () => {
      insertThread({ runId: 'run-1', runHeartbeatAt: STARTED_AT });

      await markStopRequested({
        threadId: THREAD_ID,
        userId: 'u1',
        requestedAt: STARTED_AT,
      });

      expect(selectRunState()).toMatchObject({ stop_requested_at: STARTED_AT });
    });
  });

  describe('異常系', () => {
    it('実行中でなければ書かない', async () => {
      insertThread({});

      await markStopRequested({
        threadId: THREAD_ID,
        userId: 'u1',
        requestedAt: STARTED_AT,
      });

      expect(selectRunState()).toMatchObject({ stop_requested_at: null });
    });

    it('ほかの利用者のスレッドには書かない', async () => {
      insertThread({ userId: 'u2', runId: 'run-1' });

      await markStopRequested({
        threadId: THREAD_ID,
        userId: 'u1',
        requestedAt: STARTED_AT,
      });

      expect(selectRunState()).toMatchObject({ stop_requested_at: null });
    });
  });

  describe('エッジケース', () => {
    it('前の実行への停止の要求は、新しい実行を始めると消える', async () => {
      insertThread({
        runId: 'run-1',
        runHeartbeatAt: '2026-10-14T11:00:00.000Z',
      });
      await markStopRequested({
        threadId: THREAD_ID,
        userId: 'u1',
        requestedAt: '2026-10-14T11:00:01.000Z',
      });

      await claim({ runId: 'run-2' });

      await expect(
        touchRunHeartbeat({
          threadId: THREAD_ID,
          runId: 'run-2',
          heartbeatAt: STARTED_AT,
        }),
      ).resolves.toStrictEqual({ stopRequested: false });
    });
  });
});

describe('updateLastInputTokens', () => {
  describe('正常系', () => {
    it('スレッドの直近の入力トークン数を書く', async () => {
      insertThread({});

      await updateLastInputTokens({ threadId: THREAD_ID, inputTokens: 12_345 });

      await expect(selectThread(THREAD_ID)).resolves.toMatchObject({
        lastInputTokens: 12_345,
      });
    });
  });
});

describe('selectThreadsByUser', () => {
  describe('正常系', () => {
    it('自分のスレッドだけを、更新の新しい順に返す', async () => {
      insertThread({ id: 't-old', updatedAt: '2026-10-01T00:00:00.000Z' });
      insertThread({ id: 't-new', updatedAt: '2026-10-03T00:00:00.000Z' });
      insertThread({
        id: 't-other',
        userId: 'u2',
        updatedAt: '2026-10-04T00:00:00.000Z',
      });

      const threads = await selectThreadsByUser('u1');

      expect(threads.map((thread) => thread.id)).toStrictEqual([
        't-new',
        't-old',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('101 件以上あっても、新しい 100 件だけを返す', async () => {
      for (let day = 1; day <= 101; day += 1) {
        insertThread({
          id: `t-${day}`,
          updatedAt: new Date(Date.UTC(2026, 6, day)).toISOString(),
        });
      }

      const threads = await selectThreadsByUser('u1');

      expect(threads).toHaveLength(100);
      expect(threads.at(-1)?.id).toBe('t-2');
    });
  });
});

describe('selectThread', () => {
  describe('異常系', () => {
    it('スレッドが無ければ null を返す', async () => {
      await expect(selectThread(THREAD_ID)).resolves.toBeNull();
    });
  });
});

describe('insertThreadMessage / selectThreadMessages', () => {
  describe('正常系', () => {
    it('メッセージを JSON のまま、書いた順に返す', async () => {
      insertThread({});
      const user = {
        id: 'm1',
        role: 'user',
        parts: [{ type: 'text', text: '要約して' }],
      };
      const assistant = {
        id: 'm2',
        role: 'assistant',
        parts: [{ type: 'text', text: '要約です' }],
        metadata: { end: 'completed' },
      };

      await insertThreadMessage({ threadId: THREAD_ID, message: user });
      await insertThreadMessage({ threadId: THREAD_ID, message: assistant });
      await insertThreadMessage({ threadId: 'other', message: user });

      await expect(selectThreadMessages(THREAD_ID)).resolves.toStrictEqual([
        user,
        assistant,
      ]);
    });
  });
});
