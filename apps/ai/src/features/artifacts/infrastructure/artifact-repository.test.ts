import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';

import { db } from '@repo/ai-database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  insertArtifactWithFirstVersion,
  insertNextVersion,
  selectArtifacts,
  selectArtifactVersions,
  selectVersion,
} from './artifact-repository';

vi.mock('server-only', () => ({}));

// 接続はしないが、db を作るときに URL の形式が検査される
vi.hoisted(() => {
  vi.stubEnv('AI_TURSO_DATABASE_URL', 'http://localhost');
});

// libsql の代わりに、生成物・版・公開の3つのテーブルだけを持つインメモリの SQLite で SQL を実行する
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
const artifactRows = (): unknown[] =>
  structuredClone(
    sqlite
      .prepare('select id, user_id, kind, created_at from ai_artifacts')
      .all(),
  );

const versionRows = (): unknown[] =>
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
    create index ai_artifacts_user_id_idx on ai_artifacts (user_id);
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
    create table ai_artifact_shares (
      artifact_id text primary key not null references ai_artifacts(id) on delete cascade,
      slug text not null,
      version_id integer not null references ai_artifact_versions(id) on delete cascade
    );
    create unique index ai_artifact_shares_slug_unique on ai_artifact_shares (slug);
  `);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('insertArtifactWithFirstVersion', () => {
  describe('正常系', () => {
    it('生成物と、親の無い版 1 を書く', async () => {
      await insertArtifactWithFirstVersion(firstVersion);

      expect(artifactRows()).toStrictEqual([
        { id: 'a1b2c3d4e5f6', user_id: 'u1', kind: 'ui', created_at: NOW },
      ]);
      expect(versionRows()).toStrictEqual([
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

      expect(versionRows()).toStrictEqual([
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
      expect(versionRows()).toMatchObject([
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

      expect(versionRows()).toMatchObject([
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
  } as const;

  describe('正常系', () => {
    it('持ち主・版番号が合えば、その版の id・生成物の種類・タイトル・中身を返す', async () => {
      await expect(selectVersion(query)).resolves.toStrictEqual({
        id: 2,
        kind: 'ui',
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

describe('selectArtifacts', () => {
  describe('正常系', () => {
    it('持ち主の生成物を、最新版を作った時刻の新しい順に、最新版のタイトルと時刻で返す', async () => {
      await insertArtifactWithFirstVersion(firstVersion);
      vi.setSystemTime(Date.parse('2026-10-15T13:00:00.000Z'));
      await insertArtifactWithFirstVersion({
        ...firstVersion,
        id: 'f6e5d4c3b2a1',
        kind: 'slides',
        title: 'LT の資料',
        content: { source: '## まとめ' },
      });
      vi.setSystemTime(Date.parse('2026-10-15T14:00:00.000Z'));
      await insertNextVersion({
        artifactId: firstVersion.id,
        parentId: 1,
        threadId: 'thread-2',
        title: '大きいボタンの問い合わせフォーム',
        instruction: 'ボタンを大きくする',
        summary: 'ボタンを大きくしました。',
        content: { spec: SPEC },
      });

      await expect(selectArtifacts({ userId: 'u1' })).resolves.toStrictEqual([
        {
          id: 'a1b2c3d4e5f6',
          kind: 'ui',
          title: '大きいボタンの問い合わせフォーム',
          updatedAt: '2026-10-15T14:00:00.000Z',
          isPublic: false,
        },
        {
          id: 'f6e5d4c3b2a1',
          kind: 'slides',
          title: 'LT の資料',
          updatedAt: '2026-10-15T13:00:00.000Z',
          isPublic: false,
        },
      ]);
    });

    it('公開の行がある生成物だけを、公開中として返す', async () => {
      await insertArtifactWithFirstVersion(firstVersion);
      await insertArtifactWithFirstVersion({
        ...firstVersion,
        id: 'f6e5d4c3b2a1',
      });
      sqlite.exec(
        "insert into ai_artifact_shares (artifact_id, slug, version_id) values ('f6e5d4c3b2a1', 'AAAAAAAAAAAAAAAA', 2)",
      );

      const listed = await selectArtifacts({ userId: 'u1' });

      expect(
        listed.map(({ id, isPublic }) => ({ id, isPublic })),
      ).toStrictEqual([
        { id: 'a1b2c3d4e5f6', isPublic: false },
        { id: 'f6e5d4c3b2a1', isPublic: true },
      ]);
    });
  });

  describe('異常系', () => {
    it('ほかの利用者の生成物は返さない', async () => {
      await insertArtifactWithFirstVersion(firstVersion);
      await insertArtifactWithFirstVersion({
        ...firstVersion,
        id: 'f6e5d4c3b2a1',
        userId: 'u2',
      });

      await expect(selectArtifacts({ userId: 'u1' })).resolves.toMatchObject([
        { id: 'a1b2c3d4e5f6' },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('101件あれば、最新版の新しい100件までを返す', async () => {
      const insertArtifact = sqlite.prepare(
        "insert into ai_artifacts (id, user_id, kind, created_at) values (?, 'u1', 'ui', ?)",
      );
      const insertVersion = sqlite.prepare(
        "insert into ai_artifact_versions (artifact_id, version, title, instruction, summary, content, created_at) values (?, 1, 'UI', '', '', '{}', ?)",
      );
      for (let minute = 0; minute <= 100; minute += 1) {
        const id = `artifact-${minute.toString().padStart(3, '0')}`;
        const createdAt = new Date(
          Date.parse(NOW) + minute * 60_000,
        ).toISOString();
        insertArtifact.run(id, createdAt);
        insertVersion.run(id, createdAt);
      }

      const listed = await selectArtifacts({ userId: 'u1' });

      expect(listed).toHaveLength(100);
      expect(listed.at(0)?.id).toBe('artifact-100');
      expect(listed.at(-1)?.id).toBe('artifact-001');
    });
  });
});

describe('selectArtifactVersions', () => {
  beforeEach(async () => {
    await insertArtifactWithFirstVersion(firstVersion);
    vi.setSystemTime(Date.parse('2026-10-15T13:00:00.000Z'));
    await nextVersion({ parentId: 1 });
    vi.setSystemTime(Date.parse('2026-10-15T14:00:00.000Z'));
    await insertNextVersion({
      artifactId: firstVersion.id,
      parentId: 1,
      threadId: 'thread-2',
      title: '検索つきの問い合わせフォーム',
      instruction: '最初の版に検索欄を足す',
      summary: '検索欄を足しました。',
      content: { spec: SPEC },
    });
  });

  const query = { artifactId: 'a1b2c3d4e5f6', userId: 'u1' } as const;

  describe('正常系', () => {
    it('生成物の全版を、新しい順に、生成物の種類と土台にした版の番号を添えて返し、中身は返さない', async () => {
      await expect(selectArtifactVersions(query)).resolves.toStrictEqual([
        {
          kind: 'ui',
          version: 3,
          title: '検索つきの問い合わせフォーム',
          instruction: '最初の版に検索欄を足す',
          summary: '検索欄を足しました。',
          threadId: 'thread-2',
          createdAt: '2026-10-15T14:00:00.000Z',
          parentArtifactId: 'a1b2c3d4e5f6',
          parentVersion: 1,
        },
        {
          kind: 'ui',
          version: 2,
          title: '問い合わせフォーム',
          instruction: 'ボタンを大きくする',
          summary: 'ボタンを大きくしました。',
          threadId: 'thread-1',
          createdAt: '2026-10-15T13:00:00.000Z',
          parentArtifactId: 'a1b2c3d4e5f6',
          parentVersion: 1,
        },
        {
          kind: 'ui',
          version: 1,
          title: '問い合わせフォーム',
          instruction: '名前とメールの入力欄と送信ボタンを置く',
          summary: '入力欄2つと送信ボタンのフォームです。',
          threadId: 'thread-1',
          createdAt: NOW,
          parentArtifactId: null,
          parentVersion: null,
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('持ち主でなければ空の配列を返す', async () => {
      await expect(
        selectArtifactVersions({ ...query, userId: 'u2' }),
      ).resolves.toStrictEqual([]);
    });

    it('生成物が無ければ空の配列を返す', async () => {
      await expect(
        selectArtifactVersions({ ...query, artifactId: 'f6e5d4c3b2a1' }),
      ).resolves.toStrictEqual([]);
    });
  });
});
