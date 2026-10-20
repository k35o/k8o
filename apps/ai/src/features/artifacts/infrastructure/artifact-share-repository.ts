import 'server-only';
import { db } from '@repo/ai-database';
import { and, eq, inArray } from '@repo/ai-database/orm';
import type { AiArtifactKind } from '@repo/ai-database/schema';

const artifacts = db._schema.aiArtifacts;
const versions = db._schema.aiArtifactVersions;
const shares = db._schema.aiArtifactShares;

type ShareRow = {
  slug: string;
  version: number;
};

type PublicVersionRow = {
  kind: AiArtifactKind;
  title: string;
  content: unknown;
};

export const upsertShare = async (input: {
  artifactId: string;
  slug: string;
  versionId: number;
}): Promise<string> => {
  const [row] = await db
    .insert(shares)
    .values(input)
    .onConflictDoUpdate({
      target: shares.artifactId,
      set: { versionId: input.versionId },
    })
    .returning({ slug: shares.slug });
  if (row === undefined) {
    throw new Error('failed to upsert ai artifact share');
  }
  return row.slug;
};

export const updateSharedVersion = async (input: {
  artifactId: string;
  versionId: number;
}): Promise<boolean> => {
  const updated = await db
    .update(shares)
    .set({ versionId: input.versionId })
    .where(eq(shares.artifactId, input.artifactId))
    .returning({ artifactId: shares.artifactId });
  return updated.length > 0;
};

export const deleteShare = async (input: {
  artifactId: string;
  userId: string;
}): Promise<boolean> => {
  const deleted = await db
    .delete(shares)
    .where(
      and(
        eq(shares.artifactId, input.artifactId),
        inArray(
          shares.artifactId,
          db
            .select({ id: artifacts.id })
            .from(artifacts)
            .where(eq(artifacts.userId, input.userId)),
        ),
      ),
    )
    .returning({ artifactId: shares.artifactId });
  return deleted.length > 0;
};

export const selectShareOfArtifact = async (input: {
  artifactId: string;
  userId: string;
}): Promise<ShareRow | null> => {
  const [row] = await db
    .select({ slug: shares.slug, version: versions.version })
    .from(shares)
    .innerJoin(artifacts, eq(artifacts.id, shares.artifactId))
    .innerJoin(versions, eq(versions.id, shares.versionId))
    .where(
      and(
        eq(shares.artifactId, input.artifactId),
        eq(artifacts.userId, input.userId),
      ),
    )
    .limit(1);
  return row ?? null;
};

export const selectSharedVersionId = async (
  slug: string,
): Promise<number | null> => {
  const [row] = await db
    .select({ versionId: shares.versionId })
    .from(shares)
    .where(eq(shares.slug, slug))
    .limit(1);
  return row?.versionId ?? null;
};

// 公開の行と結ばない。版の行は書き換えないので、版の id ごとに中身をキャッシュしても、公開する版の
// 切り替えや取り消しで古くならない。公開しているかは、呼び出し側が slug から版の id を引くときに決まる
export const selectPublicVersion = async (
  versionId: number,
): Promise<PublicVersionRow | null> => {
  const [row] = await db
    .select({
      kind: artifacts.kind,
      title: versions.title,
      content: versions.content,
    })
    .from(versions)
    .innerJoin(artifacts, eq(artifacts.id, versions.artifactId))
    .where(eq(versions.id, versionId))
    .limit(1);
  return row ?? null;
};
