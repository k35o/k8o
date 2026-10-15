import 'server-only';
import { db } from '@repo/ai-database';
import { and, eq, sql } from '@repo/ai-database/orm';
import type { AiArtifactKind } from '@repo/ai-database/schema';

const artifacts = db._schema.aiArtifacts;
const versions = db._schema.aiArtifactVersions;

type VersionValues = {
  threadId: string;
  title: string;
  instruction: string;
  summary: string;
  content: unknown;
};

type VersionRow = {
  id: number;
  title: string;
  content: unknown;
};

// libSQL の HTTP の対話トランザクションは往復ごとにロックを持ち続けるので、版の無い生成物が
// 残らないよう、生成物と版 1 を1回の batch（暗黙のトランザクション）で書く
export const insertArtifactWithFirstVersion = async (
  input: VersionValues & {
    id: string;
    userId: string;
    kind: AiArtifactKind;
  },
): Promise<void> => {
  await db.batch([
    db
      .insert(artifacts)
      .values({ id: input.id, userId: input.userId, kind: input.kind }),
    db.insert(versions).values({
      artifactId: input.id,
      version: 1,
      parentId: null,
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
  kind: AiArtifactKind;
}): Promise<VersionRow | null> => {
  const [row] = await db
    .select({
      id: versions.id,
      title: versions.title,
      content: versions.content,
    })
    .from(versions)
    .innerJoin(artifacts, eq(artifacts.id, versions.artifactId))
    .where(
      and(
        eq(versions.artifactId, input.artifactId),
        eq(versions.version, input.version),
        eq(artifacts.userId, input.userId),
        eq(artifacts.kind, input.kind),
      ),
    )
    .limit(1);
  return row ?? null;
};
