import 'server-only';
import { db } from '@repo/ai-database';
import {
  alias,
  and,
  desc,
  eq,
  isNotNull,
  max,
  sql,
} from '@repo/ai-database/orm';
import type { AiArtifactKind } from '@repo/ai-database/schema';

const artifacts = db._schema.aiArtifacts;
const versions = db._schema.aiArtifactVersions;
const shares = db._schema.aiArtifactShares;

const ARTIFACT_LIST_LIMIT = 100;

type VersionValues = {
  threadId: string;
  title: string;
  instruction: string;
  summary: string;
  content: unknown;
};

type VersionRow = {
  id: number;
  kind: AiArtifactKind;
  title: string;
  summary: string;
  content: unknown;
};

type ArtifactRow = {
  id: string;
  kind: AiArtifactKind;
  title: string;
  updatedAt: string;
  isPublic: boolean;
};

type HistoryRow = {
  kind: AiArtifactKind;
  version: number;
  title: string;
  instruction: string;
  summary: string;
  threadId: string | null;
  createdAt: string;
  parentArtifactId: string | null;
  parentVersion: number | null;
  parentTitle: string | null;
};

// libSQL の HTTP の対話トランザクションは往復ごとにロックを持ち続けるので、版の無い生成物が
// 残らないよう、生成物と版 1 を1回の batch（暗黙のトランザクション）で書く
export const insertArtifactWithFirstVersion = async (
  input: Omit<VersionValues, 'threadId'> & {
    id: string;
    userId: string;
    kind: AiArtifactKind;
    parentId: number | null;
    threadId: string | null;
  },
): Promise<void> => {
  await db.batch([
    db
      .insert(artifacts)
      .values({ id: input.id, userId: input.userId, kind: input.kind }),
    db.insert(versions).values({
      artifactId: input.id,
      version: 1,
      parentId: input.parentId,
      threadId: input.threadId,
      title: input.title,
      instruction: input.instruction,
      summary: input.summary,
      content: input.content,
    }),
  ]);
};

// 番号を読んでから足すと、同じステップで並んで呼ばれた版が同じ番号を取り合うので、
// 次の番号を採るのと版を足すのを1文で行う
export const insertNextVersion = async (
  input: VersionValues & {
    artifactId: string;
    parentId: number;
  },
): Promise<number> => {
  const [row] = await db
    .insert(versions)
    .select((qb) =>
      qb
        .select({
          // insert ... select は全列をテーブル定義の順に並べる必要があり、列の既定値も
          // json の変換も掛からないので、id には NULL を渡して採番させ、content は
          // JSON の文字列にし、created_at には時刻を渡す
          id: sql<number>`null`.as('id'),
          artifactId: sql<string>`${input.artifactId}`.as('artifact_id'),
          version: sql<number>`coalesce(max(${versions.version}), 0) + 1`.as(
            'version',
          ),
          parentId: sql<number>`${input.parentId}`.as('parent_id'),
          threadId: sql<string>`${input.threadId}`.as('thread_id'),
          title: sql<string>`${input.title}`.as('title'),
          instruction: sql<string>`${input.instruction}`.as('instruction'),
          summary: sql<string>`${input.summary}`.as('summary'),
          content: sql<string>`${JSON.stringify(input.content)}`.as('content'),
          createdAt: sql<string>`${new Date().toISOString()}`.as('created_at'),
        })
        .from(versions)
        .where(eq(versions.artifactId, input.artifactId)),
    )
    .returning({ version: versions.version });
  if (row === undefined) {
    throw new Error('failed to insert ai artifact version');
  }
  return row.version;
};

export const selectVersion = async (input: {
  artifactId: string;
  version: number;
  userId: string;
}): Promise<VersionRow | null> => {
  const [row] = await db
    .select({
      id: versions.id,
      kind: artifacts.kind,
      title: versions.title,
      summary: versions.summary,
      content: versions.content,
    })
    .from(versions)
    .innerJoin(artifacts, eq(artifacts.id, versions.artifactId))
    .where(
      and(
        eq(versions.artifactId, input.artifactId),
        eq(versions.version, input.version),
        eq(artifacts.userId, input.userId),
      ),
    )
    .limit(1);
  return row ?? null;
};

export const selectArtifacts = async (input: {
  userId: string;
}): Promise<ArtifactRow[]> => {
  const others = alias(versions, 'others');
  const latestVersion = db
    .select({ version: max(others.version) })
    .from(others)
    .where(eq(others.artifactId, artifacts.id));
  return db
    .select({
      id: artifacts.id,
      kind: artifacts.kind,
      title: versions.title,
      updatedAt: versions.createdAt,
      isPublic: isNotNull(shares.artifactId).mapWith(Boolean),
    })
    .from(artifacts)
    .innerJoin(
      versions,
      and(
        eq(versions.artifactId, artifacts.id),
        eq(versions.version, latestVersion),
      ),
    )
    .leftJoin(shares, eq(shares.artifactId, artifacts.id))
    .where(eq(artifacts.userId, input.userId))
    .orderBy(desc(versions.createdAt))
    .limit(ARTIFACT_LIST_LIMIT);
};

export const selectArtifactVersions = async (input: {
  artifactId: string;
  userId: string;
}): Promise<HistoryRow[]> => {
  const parents = alias(versions, 'parents');
  return db
    .select({
      kind: artifacts.kind,
      version: versions.version,
      title: versions.title,
      instruction: versions.instruction,
      summary: versions.summary,
      threadId: versions.threadId,
      createdAt: versions.createdAt,
      parentArtifactId: parents.artifactId,
      parentVersion: parents.version,
      parentTitle: parents.title,
    })
    .from(versions)
    .innerJoin(artifacts, eq(artifacts.id, versions.artifactId))
    .leftJoin(parents, eq(parents.id, versions.parentId))
    .where(
      and(
        eq(versions.artifactId, input.artifactId),
        eq(artifacts.userId, input.userId),
      ),
    )
    .orderBy(desc(versions.version));
};
