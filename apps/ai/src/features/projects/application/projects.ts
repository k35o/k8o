import 'server-only';
import { randomUUID } from 'node:crypto';

import type { AiApp, AiVisibility } from '@repo/database/schema';

import type { GenerationMeta } from '@/features/generation/application/parse-generation';

import {
  insertProjectWithVersion,
  insertVersion,
  type ProjectListItem,
  projectOwnedBy,
  selectIsSlugPublic,
  selectProjects,
  selectProjectWithLatestVersion,
  selectPublicProjectBySlug,
  updateProjectVisibility,
} from '../infrastructure/project-repository';

// ui-studio の版に保存する content の形（アプリ非依存の JSON ペイロードのうち ui-studio 用）。
export type UiStudioContent = {
  code: string;
  meta: GenerationMeta;
};

export type LoadedProject = {
  id: number;
  title: string;
  slug: string;
  code: string;
  meta: GenerationMeta;
  versionId: number;
};

export type PublicProject = {
  id: number;
  title: string;
  slug: string;
  code: string;
  meta: GenerationMeta;
};

export type { ProjectListItem };

const UI_STUDIO: AiApp = 'ui-studio';

// 公開リンク用の一意 slug。/s/[slug] で使う。衝突確率は無視できる程度に小さい。
const generateSlug = (): string =>
  randomUUID().replaceAll('-', '').slice(0, 12);

const deriveTitle = (title: string): string => {
  const trimmed = title.trim();
  return trimmed === '' ? '無題の UI' : trimmed;
};

// version.content(JSON, unknown)を ui-studio の content として検証する。壊れていれば null。
const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const toStringOr = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const parseContent = (value: unknown): UiStudioContent | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { code, meta } = value as Record<string, unknown>;
  if (typeof code !== 'string') {
    return null;
  }
  if (typeof meta !== 'object' || meta === null) {
    return null;
  }
  const metaRecord = meta as Record<string, unknown>;
  return {
    code,
    meta: {
      title: toStringOr(metaRecord['title'], ''),
      description: toStringOr(metaRecord['description'], ''),
      usedComponents: toStringArray(metaRecord['usedComponents']),
      changes: toStringArray(metaRecord['changes']),
    },
  };
};

// 生成結果を保存する。projectId が null なら新規プロジェクト＋初版、そうでなければ版を追記。
export const saveGeneration = async (input: {
  userId: string;
  projectId: number | null;
  parentVersionId: number | null;
  content: UiStudioContent;
}): Promise<{ projectId: number; versionId: number; title: string }> => {
  if (input.projectId === null) {
    const title = deriveTitle(input.content.meta.title);
    const { projectId, versionId } = await insertProjectWithVersion({
      userId: input.userId,
      app: UI_STUDIO,
      title,
      slug: generateSlug(),
      content: input.content,
    });
    return { projectId, versionId, title };
  }

  const owned = await projectOwnedBy({
    projectId: input.projectId,
    userId: input.userId,
  });
  if (!owned) {
    throw new Error('project not found');
  }
  const { versionId } = await insertVersion({
    projectId: input.projectId,
    parentId: input.parentVersionId,
    content: input.content,
  });
  return {
    projectId: input.projectId,
    versionId,
    title: deriveTitle(input.content.meta.title),
  };
};

export const getProjectsForUser = (
  userId: string,
): Promise<ProjectListItem[]> => selectProjects({ userId, app: UI_STUDIO });

// 既存プロジェクトの最新版を複製して新しいプロジェクト（forkOf 付き・private）を作る。
// 元を壊さずに派生を試すための分岐。元が見つからない（非所有）なら null。
export const forkProject = async (input: {
  userId: string;
  sourceProjectId: number;
}): Promise<{ projectId: number } | null> => {
  const source = await getProject({
    userId: input.userId,
    projectId: input.sourceProjectId,
  });
  if (source === null) {
    return null;
  }
  const { projectId } = await insertProjectWithVersion({
    userId: input.userId,
    app: UI_STUDIO,
    title: `${source.title}（フォーク）`,
    slug: generateSlug(),
    content: { code: source.code, meta: source.meta },
    forkOf: input.sourceProjectId,
  });
  return { projectId };
};

export const getProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<LoadedProject | null> => {
  const row = await selectProjectWithLatestVersion({
    projectId: input.projectId,
    userId: input.userId,
  });
  if (row === null) {
    return null;
  }
  const content = parseContent(row.content);
  if (content === null) {
    return null;
  }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    code: content.code,
    meta: content.meta,
    versionId: row.versionId,
  };
};

// 可視性/公開版を更新する。所有者でなければ false。
export const setVisibility = async (input: {
  userId: string;
  projectId: number;
  visibility: AiVisibility;
  publishedVersionId: number | null;
}): Promise<boolean> => {
  const owned = await projectOwnedBy({
    projectId: input.projectId,
    userId: input.userId,
  });
  if (!owned) {
    return false;
  }
  await updateProjectVisibility({
    projectId: input.projectId,
    visibility: input.visibility,
    publishedVersionId: input.publishedVersionId,
  });
  return true;
};

// slug が現在公開中かを判定（アセット配信の権威付け用・認証なし）。
export const isSlugPublic = (slug: string): Promise<boolean> =>
  selectIsSlugPublic(slug);

// 公開プロジェクトを slug で取得（認証なし・公開ページ用）。非公開や壊れた content は null。
export const getPublicProjectBySlug = async (
  slug: string,
): Promise<PublicProject | null> => {
  const row = await selectPublicProjectBySlug(slug);
  if (row === null) {
    return null;
  }
  const content = parseContent(row.content);
  if (content === null) {
    return null;
  }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    code: content.code,
    meta: content.meta,
  };
};
