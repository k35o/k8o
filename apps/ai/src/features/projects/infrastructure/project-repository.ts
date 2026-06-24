import 'server-only';
import { db } from '@repo/database';
import type { AiApp, AiVisibility } from '@repo/database/schema';
import { and, desc, eq } from 'drizzle-orm';

// DB アクセスはこの層に閉じる（features/*/infrastructure 以外から @repo/database を読まない）。
const projects = db._schema.aiProjects;
const versions = db._schema.aiProjectVersions;

export type ProjectListItem = {
  id: number;
  title: string;
  slug: string;
  visibility: AiVisibility;
  publishedVersionId: number | null;
  updatedAt: string;
};

export type ProjectWithVersion = {
  id: number;
  title: string;
  slug: string;
  visibility: AiVisibility;
  versionId: number;
  content: unknown;
};

export type PublicProjectRow = {
  id: number;
  title: string;
  slug: string;
  content: unknown;
};

// libsql(http) は対話トランザクション非対応のため逐次 insert で組む。
// 失敗時に孤児プロジェクトが残りうるが、本人専用ツールの履歴用途では許容する。
export const insertProjectWithVersion = async (input: {
  userId: string;
  app: AiApp;
  title: string;
  slug: string;
  content: unknown;
  forkOf?: number | null;
}): Promise<{ projectId: number; versionId: number }> => {
  const [project] = await db
    .insert(projects)
    .values({
      app: input.app,
      userId: input.userId,
      title: input.title,
      slug: input.slug,
      forkOf: input.forkOf ?? null,
    })
    .returning({ id: projects.id });
  if (project === undefined) {
    throw new Error('failed to insert ai project');
  }
  const [version] = await db
    .insert(versions)
    .values({ projectId: project.id, parentId: null, content: input.content })
    .returning({ id: versions.id });
  if (version === undefined) {
    throw new Error('failed to insert ai project version');
  }
  return { projectId: project.id, versionId: version.id };
};

// 版を追記し、履歴の並び替え用に updatedAt を更新する。
export const insertVersion = async (input: {
  projectId: number;
  parentId: number | null;
  content: unknown;
}): Promise<{ versionId: number }> => {
  const [version] = await db
    .insert(versions)
    .values({
      projectId: input.projectId,
      parentId: input.parentId,
      content: input.content,
    })
    .returning({ id: versions.id });
  if (version === undefined) {
    throw new Error('failed to insert ai project version');
  }
  await db
    .update(projects)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(projects.id, input.projectId));
  return { versionId: version.id };
};

export const projectOwnedBy = async (input: {
  projectId: number;
  userId: string;
}): Promise<boolean> => {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(eq(projects.id, input.projectId), eq(projects.userId, input.userId)),
    )
    .limit(1);
  return row !== undefined;
};

export const selectProjects = async (input: {
  userId: string;
  app: AiApp;
}): Promise<ProjectListItem[]> => {
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      visibility: projects.visibility,
      publishedVersionId: projects.publishedVersionId,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .where(and(eq(projects.userId, input.userId), eq(projects.app, input.app)))
    .orderBy(desc(projects.updatedAt))
    .limit(100);
  return rows;
};

// 所有者チェックは呼び出し側で済ませる前提。
export const updateProjectVisibility = async (input: {
  projectId: number;
  visibility: AiVisibility;
  publishedVersionId: number | null;
}): Promise<void> => {
  await db
    .update(projects)
    .set({
      visibility: input.visibility,
      publishedVersionId: input.publishedVersionId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, input.projectId));
};

// 公開ページ用（認証なし）。public かつ公開版が設定されたプロジェクトのみ返す。
export const selectPublicProjectBySlug = async (
  slug: string,
): Promise<PublicProjectRow | null> => {
  const [project] = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      visibility: projects.visibility,
      publishedVersionId: projects.publishedVersionId,
    })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  if (project?.visibility !== 'public' || project.publishedVersionId === null) {
    return null;
  }
  const [version] = await db
    .select({ content: versions.content })
    .from(versions)
    .where(eq(versions.id, project.publishedVersionId))
    .limit(1);
  if (version === undefined) {
    return null;
  }
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    content: version.content,
  };
};

// 所有者チェック込み。見つからなければ null。
export const selectProjectWithLatestVersion = async (input: {
  projectId: number;
  userId: string;
}): Promise<ProjectWithVersion | null> => {
  const [project] = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      visibility: projects.visibility,
    })
    .from(projects)
    .where(
      and(eq(projects.id, input.projectId), eq(projects.userId, input.userId)),
    )
    .limit(1);
  if (project === undefined) {
    return null;
  }
  const [version] = await db
    .select({ id: versions.id, content: versions.content })
    .from(versions)
    .where(eq(versions.projectId, input.projectId))
    .orderBy(desc(versions.id))
    .limit(1);
  if (version === undefined) {
    return null;
  }
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    visibility: project.visibility,
    versionId: version.id,
    content: version.content,
  };
};

export type ProjectVersionRow = { id: number; content: unknown };

// 全版を古い順に返す。所有者チェックは呼び出し側で済ませる前提。
export const selectProjectVersions = (input: {
  projectId: number;
}): Promise<ProjectVersionRow[]> =>
  db
    .select({ id: versions.id, content: versions.content })
    .from(versions)
    .where(eq(versions.projectId, input.projectId))
    .orderBy(versions.id);
