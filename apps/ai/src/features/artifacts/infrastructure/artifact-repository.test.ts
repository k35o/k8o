import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';

import { db } from '@repo/ai-database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectVersion,
} from './artifact-repository';

vi.mock('server-only', () => ({}));

// 接続はしないが、db を作るときに URL の形式が検査される
vi.hoisted(() => {
  vi.stubEnv('AI_TURSO_DATABASE_URL', 'http://localhost');
});

// libsql の代わりに、ai_artifacts と ai_artifact_versions だけを持つインメモリの SQLite で SQL を実行する
let sqlite: DatabaseSync;

const run = (statement: unknown): { rows: unknown[] } => {
  const { sql, args } = statement as { sql: string; args: SQLInputValue[] };
  const prepared = sqlite.prepare(sql);
  prepared.setReturnArrays(true);
  return { rows: prepared.all(...args) };
};

vi.spyOn(db.$client, 'execute').mockImplementation((statement) =>
  Promise.resolve(run(statement) as never),
);
const batch = vi
  .spyOn(db.$client, 'batch')
  .mockImplementation((statements) =>
    Promise.resolve(statements.map(run) as never),
  );

const NOW = '2026-10-15T12:00:00.000Z';
const SPEC = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

const firstVersion = {
  id: 'a1b2c3d4e5f6',
  userId: 'u1',
  kind: 'ui',
  threadId: 'thread-1',
  title: '問い合わせフォーム',
  instruction: '名前とメールの入力欄と送信ボタンを置く',
  summary: '入力欄2つと送信ボタンのフォームです。',
  content: { spec: SPEC },
} as const;

const nextVersion = (input: {
  parentId: number;
  artifactId?: string;
}): Promise<number> =>
  insertNextVersion({
    artifactId: input.artifactId ?? firstVersion.id,
    parentId: input.parentId,
    threadId: 'thread-1',
    title: '問い合わせフォーム',
    instruction: 'ボタンを大きくする',
    summary: 'ボタンを大きくしました。',
    content: { spec: SPEC },
  });

// node:sqlite の行はプロトタイプを持たないので、比べられるよう普通のオブジェクトに写す
const selectArtifacts = (): unknown[] =>
  structuredClone(
    sqlite
      .prepare('select id, user_id, kind, created_at from ai_artifacts')
      .all(),
  );

const selectVersions = (): unknown[] =>
  structuredClone(
    sqlite
      .prepare(
        'select id, artifact_id, version, parent_id, thread_id, title, instruction, summary, content, created_at from ai_artifact_versions order by id',
      )
      .all(),
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: Date.parse(NOW) });
  sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    create table ai_artifacts (
      id text primary key not null,
      user_id text not null,
      kind text not null,
      created_at text not null
    );
    create table ai_artifact_versions (
      id integer primary key autoincrement not null,
      artifact_id text not null references ai_artifacts(id) on delete cascade,
      version integer not null,
      parent_id integer,
      thread_id text,
      title text not null,
      instruction text not null,
      summary text not null,
      content text not null,
      created_at text not null
    );
    create unique index ai_artifact_versions_artifact_version_idx
      on ai_artifact_versions (artifact_id, version);
  `);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('insertArtifactWithFirstVersion', () => {
  describe('正常系', () => {
    it('生成物と、親の無い版 1 を書く', async () => {
      await insertArtifactWithFirstVersion(firstVersion);

      expect(selectArtifacts()).toStrictEqual([
        { id: 'a1b2c3d4e5f6', user_id: 'u1', kind: 'ui', created_at: NOW },
      ]);
      expect(selectVersions()).toStrictEqual([
        {
          id: 1,
          artifact_id: 'a1b2c3d4e5f6',
          version: 1,
          parent_id: null,
          thread_id: 'thread-1',
          title: '問い合わせフォーム',
          instruction: '名前とメールの入力欄と送信ボタンを置く',
          summary: '入力欄2つと送信ボタンのフォームです。',
          content:
            '{"spec":{"root":"a","elements":{"a":{"type":"Button","props":{"label":"OK"}}}}}',
          created_at: NOW,
        },
      ]);
    });

    it('版の無い生成物が残らないよう、生成物と版を1回の batch で書く', async () => {
      await insertArtifactWithFirstVersion(firstVersion);

      expect(batch).toHaveBeenCalledOnce();
      expect(batch.mock.calls[0]?.[0]).toHaveLength(2);
    });
  });
});

describe('insertNextVersion', () => {
  beforeEach(async () => {
    await insertArtifactWithFirstVersion(firstVersion);
  });

  describe('正常系', () => {
    it('その生成物の最後の版の次の番号で、土台を親にした版を足し、その番号を返す', async () => {
      await expect(nextVersion({ parentId: 1 })).resolves.toBe(2);

      expect(selectVersions()).toStrictEqual([
        expect.objectContaining({ id: 1, version: 1 }),
        {
          id: 2,
          artifact_id: 'a1b2c3d4e5f6',
          version: 2,
          parent_id: 1,
          thread_id: 'thread-1',
          title: '問い合わせフォーム',
          instruction: 'ボタンを大きくする',
          summary: 'ボタンを大きくしました。',
          content:
            '{"spec":{"root":"a","elements":{"a":{"type":"Button","props":{"label":"OK"}}}}}',
          created_at: NOW,
        },
      ]);
    });

    it('古い版を土台にしても、番号は最後の版の次になり、親は土台の版を指す', async () => {
      await nextVersion({ parentId: 1 });

      await expect(nextVersion({ parentId: 1 })).resolves.toBe(3);
      expect(selectVersions()).toMatchObject([
        { id: 1, version: 1, parent_id: null },
        { id: 2, version: 2, parent_id: 1 },
        { id: 3, version: 3, parent_id: 1 },
      ]);
    });
  });

  describe('異常系', () => {
    it('存在しない生成物を指すと reject し、版を残さない', async () => {
      await expect(
        nextVersion({ artifactId: 'f6e5d4c3b2a1', parentId: 1 }),
      ).rejects.toThrow(
        expect.objectContaining({
          cause: expect.objectContaining({
            message: expect.stringContaining('FOREIGN KEY constraint failed'),
          }),
        }),
      );

      expect(selectVersions()).toMatchObject([
        { id: 1, artifact_id: 'a1b2c3d4e5f6', version: 1 },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('ほかの生成物の版は、番号に数えない', async () => {
      await nextVersion({ parentId: 1 });
      await insertArtifactWithFirstVersion({
        ...firstVersion,
        id: 'f6e5d4c3b2a1',
      });

      await expect(
        nextVersion({ artifactId: 'f6e5d4c3b2a1', parentId: 3 }),
      ).resolves.toBe(2);
    });

    it('同時に足しても、版番号はぶつからない', async () => {
      const added = await Promise.all([
        nextVersion({ parentId: 1 }),
        nextVersion({ parentId: 1 }),
      ]);

      expect(added.toSorted()).toStrictEqual([2, 3]);
    });
  });
});

describe('selectVersion', () => {
  beforeEach(async () => {
    await insertArtifactWithFirstVersion(firstVersion);
    await nextVersion({ parentId: 1 });
  });

  const query = {
    artifactId: 'a1b2c3d4e5f6',
    version: 2,
    userId: 'u1',
    kind: 'ui',
  } as const;

  describe('正常系', () => {
    it('持ち主・種類・版番号が合えば、その版の id・タイトル・中身を返す', async () => {
      await expect(selectVersion(query)).resolves.toStrictEqual({
        id: 2,
        title: '問い合わせフォーム',
        content: { spec: SPEC },
      });
    });
  });

  describe('異常系', () => {
    it('持ち主でなければ null を返す', async () => {
      await expect(
        selectVersion({ ...query, userId: 'u2' }),
      ).resolves.toBeNull();
    });

    it('種類が違う生成物なら null を返す', async () => {
      sqlite.exec(
        "update ai_artifacts set kind = 'slides' where id = 'a1b2c3d4e5f6'",
      );

      await expect(selectVersion(query)).resolves.toBeNull();
    });

    it('その番号の版が無ければ null を返す', async () => {
      await expect(selectVersion({ ...query, version: 3 })).resolves.toBeNull();
    });

    it('生成物が無ければ null を返す', async () => {
      await expect(
        selectVersion({ ...query, artifactId: 'f6e5d4c3b2a1' }),
      ).resolves.toBeNull();
    });
  });
});
