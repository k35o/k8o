import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';

import { db } from '@repo/ai-database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  deleteShare,
  selectPublicVersion,
  selectSharedVersionId,
  selectShareOfArtifact,
  updateSharedVersion,
  upsertShare,
} from './artifact-share-repository';

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

const SPEC = {
  root: 'a',
  elements: { a: { type: 'Button', props: { label: 'OK' } } },
};

// node:sqlite の行はプロトタイプを持たないので、比べられるよう普通のオブジェクトに写す
const shareRows = (): unknown[] =>
  structuredClone(
    sqlite
      .prepare(
        'select artifact_id, slug, version_id from ai_artifact_shares order by artifact_id',
      )
      .all(),
  );

beforeEach(() => {
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
    create table ai_artifact_shares (
      artifact_id text primary key not null references ai_artifacts(id) on delete cascade,
      slug text not null,
      version_id integer not null references ai_artifact_versions(id) on delete cascade
    );
    create unique index ai_artifact_shares_slug_unique on ai_artifact_shares (slug);

    insert into ai_artifacts (id, user_id, kind, created_at) values
      ('a1b2c3d4e5f6', 'u1', 'ui', '2026-10-15T12:00:00.000Z'),
      ('f6e5d4c3b2a1', 'u2', 'slides', '2026-10-15T12:00:00.000Z');
    insert into ai_artifact_versions
      (id, artifact_id, version, parent_id, thread_id, title, instruction, summary, content, created_at)
    values
      (1, 'a1b2c3d4e5f6', 1, null, 'thread-1', '問い合わせフォーム', '問い合わせフォームを作る', 'フォームです。', '${JSON.stringify({ spec: SPEC })}', '2026-10-15T12:00:00.000Z'),
      (2, 'a1b2c3d4e5f6', 2, 1, 'thread-1', '大きいボタンの問い合わせフォーム', 'ボタンを大きくする', 'ボタンを大きくしました。', '${JSON.stringify({ spec: SPEC })}', '2026-10-15T13:00:00.000Z'),
      (3, 'f6e5d4c3b2a1', 1, null, 'thread-2', 'LT の資料', 'LT の資料を作る', '5枚の資料です。', '{"source":"## まとめ"}', '2026-10-15T12:00:00.000Z');
  `);
});

describe('upsertShare', () => {
  describe('正常系', () => {
    it('公開していない生成物なら、渡した slug と版で公開の行を作り、その slug を返す', async () => {
      await expect(
        upsertShare({
          artifactId: 'a1b2c3d4e5f6',
          slug: 'AAAAAAAAAAAAAAAA',
          versionId: 1,
        }),
      ).resolves.toBe('AAAAAAAAAAAAAAAA');

      expect(shareRows()).toStrictEqual([
        {
          artifact_id: 'a1b2c3d4e5f6',
          slug: 'AAAAAAAAAAAAAAAA',
          version_id: 1,
        },
      ]);
    });

    it('公開中の生成物なら、slug はそのままで公開する版だけを変え、今の slug を返す', async () => {
      await upsertShare({
        artifactId: 'a1b2c3d4e5f6',
        slug: 'AAAAAAAAAAAAAAAA',
        versionId: 1,
      });

      await expect(
        upsertShare({
          artifactId: 'a1b2c3d4e5f6',
          slug: 'BBBBBBBBBBBBBBBB',
          versionId: 2,
        }),
      ).resolves.toBe('AAAAAAAAAAAAAAAA');
      expect(shareRows()).toStrictEqual([
        {
          artifact_id: 'a1b2c3d4e5f6',
          slug: 'AAAAAAAAAAAAAAAA',
          version_id: 2,
        },
      ]);
    });

    it('取り消してから公開し直すと、前の slug に戻らず、渡した新しい slug になる', async () => {
      await upsertShare({
        artifactId: 'a1b2c3d4e5f6',
        slug: 'AAAAAAAAAAAAAAAA',
        versionId: 1,
      });
      await deleteShare({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' });

      await expect(
        upsertShare({
          artifactId: 'a1b2c3d4e5f6',
          slug: 'BBBBBBBBBBBBBBBB',
          versionId: 1,
        }),
      ).resolves.toBe('BBBBBBBBBBBBBBBB');
    });
  });
});

describe('updateSharedVersion', () => {
  beforeEach(async () => {
    await upsertShare({
      artifactId: 'a1b2c3d4e5f6',
      slug: 'AAAAAAAAAAAAAAAA',
      versionId: 1,
    });
    await upsertShare({
      artifactId: 'f6e5d4c3b2a1',
      slug: 'CCCCCCCCCCCCCCCC',
      versionId: 3,
    });
  });

  describe('正常系', () => {
    it('公開中なら、slug はそのままで公開する版だけを変えて true を返す', async () => {
      await expect(
        updateSharedVersion({ artifactId: 'a1b2c3d4e5f6', versionId: 2 }),
      ).resolves.toBe(true);

      expect(shareRows()).toStrictEqual([
        {
          artifact_id: 'a1b2c3d4e5f6',
          slug: 'AAAAAAAAAAAAAAAA',
          version_id: 2,
        },
        {
          artifact_id: 'f6e5d4c3b2a1',
          slug: 'CCCCCCCCCCCCCCCC',
          version_id: 3,
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('取り消したあとなら、公開の行を作らずに false を返す', async () => {
      await deleteShare({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' });

      await expect(
        updateSharedVersion({ artifactId: 'a1b2c3d4e5f6', versionId: 2 }),
      ).resolves.toBe(false);
      expect(shareRows()).toStrictEqual([
        {
          artifact_id: 'f6e5d4c3b2a1',
          slug: 'CCCCCCCCCCCCCCCC',
          version_id: 3,
        },
      ]);
    });
  });
});

describe('deleteShare', () => {
  beforeEach(async () => {
    await upsertShare({
      artifactId: 'a1b2c3d4e5f6',
      slug: 'AAAAAAAAAAAAAAAA',
      versionId: 2,
    });
    await upsertShare({
      artifactId: 'f6e5d4c3b2a1',
      slug: 'CCCCCCCCCCCCCCCC',
      versionId: 3,
    });
  });

  describe('正常系', () => {
    it('持ち主の生成物なら、公開の行を消して true を返す', async () => {
      await expect(
        deleteShare({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' }),
      ).resolves.toBe(true);

      expect(shareRows()).toStrictEqual([
        {
          artifact_id: 'f6e5d4c3b2a1',
          slug: 'CCCCCCCCCCCCCCCC',
          version_id: 3,
        },
      ]);
    });
  });

  describe('異常系', () => {
    it('ほかの利用者の生成物なら、公開の行を消さずに false を返す', async () => {
      await expect(
        deleteShare({ artifactId: 'f6e5d4c3b2a1', userId: 'u1' }),
      ).resolves.toBe(false);

      expect(shareRows()).toHaveLength(2);
    });

    it('公開していなければ false を返す', async () => {
      await deleteShare({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' });

      await expect(
        deleteShare({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' }),
      ).resolves.toBe(false);
    });
  });
});

describe('selectShareOfArtifact', () => {
  beforeEach(async () => {
    await upsertShare({
      artifactId: 'a1b2c3d4e5f6',
      slug: 'AAAAAAAAAAAAAAAA',
      versionId: 2,
    });
    await upsertShare({
      artifactId: 'f6e5d4c3b2a1',
      slug: 'CCCCCCCCCCCCCCCC',
      versionId: 3,
    });
  });

  describe('正常系', () => {
    it('持ち主の公開中の生成物なら、slug と公開している版の番号を返す', async () => {
      await expect(
        selectShareOfArtifact({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' }),
      ).resolves.toStrictEqual({ slug: 'AAAAAAAAAAAAAAAA', version: 2 });
    });
  });

  describe('異常系', () => {
    it('ほかの利用者の生成物なら、公開中でも null を返す', async () => {
      await expect(
        selectShareOfArtifact({ artifactId: 'f6e5d4c3b2a1', userId: 'u1' }),
      ).resolves.toBeNull();
    });

    it('公開していなければ null を返す', async () => {
      await deleteShare({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' });

      await expect(
        selectShareOfArtifact({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' }),
      ).resolves.toBeNull();
    });
  });
});

describe('selectSharedVersionId', () => {
  beforeEach(async () => {
    await upsertShare({
      artifactId: 'a1b2c3d4e5f6',
      slug: 'AAAAAAAAAAAAAAAA',
      versionId: 2,
    });
  });

  describe('正常系', () => {
    it('slug から、公開している版の id を返す', async () => {
      await expect(selectSharedVersionId('AAAAAAAAAAAAAAAA')).resolves.toBe(2);
    });
  });

  describe('異常系', () => {
    it('取り消した slug なら null を返す', async () => {
      await deleteShare({ artifactId: 'a1b2c3d4e5f6', userId: 'u1' });

      await expect(
        selectSharedVersionId('AAAAAAAAAAAAAAAA'),
      ).resolves.toBeNull();
    });

    it('どの公開にも無い slug なら null を返す', async () => {
      await expect(
        selectSharedVersionId('BBBBBBBBBBBBBBBB'),
      ).resolves.toBeNull();
    });
  });
});

describe('selectPublicVersion', () => {
  describe('正常系', () => {
    it.each([
      [
        'UI',
        2,
        {
          kind: 'ui',
          title: '大きいボタンの問い合わせフォーム',
          content: { spec: SPEC },
        },
      ],
      [
        'スライド',
        3,
        {
          kind: 'slides',
          title: 'LT の資料',
          content: { source: '## まとめ' },
        },
      ],
    ])(
      '%sの版の id から、生成物の種類と版のタイトル・中身を返す',
      async (_label, versionId, expected) => {
        await expect(selectPublicVersion(versionId)).resolves.toStrictEqual(
          expected,
        );
      },
    );
  });

  describe('異常系', () => {
    it('その id の版が無ければ null を返す', async () => {
      await expect(selectPublicVersion(9)).resolves.toBeNull();
    });
  });
});
