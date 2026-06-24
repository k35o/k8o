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
  selectProjectVersions,
  selectProjectWithLatestVersion,
  selectPublicProjectBySlug,
  updateProjectVisibility,
} from '../infrastructure/project-repository';

export type UiStudioContent = {
  code: string;
  meta: GenerationMeta;
  // 初版/フォークでは prompt が無いことがある。
  prompt?: string;
};

export type ConversationTurn = {
  prompt: string | null;
  meta: GenerationMeta;
};

export type LoadedProject = {
  id: number;
  title: string;
  slug: string;
  code: string;
  meta: GenerationMeta;
  versionId: number;
  // 古い順の全ターン（チャット復元用）。
  conversation: ConversationTurn[];
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

// 公開リンク用の一意 slug（/s/[slug]）。衝突確率は無視できる程度に小さい。
const generateSlug = (): string =>
  randomUUID().replaceAll('-', '').slice(0, 12);

const deriveTitle = (title: string): string => {
  const trimmed = title.trim();
  return trimmed === '' ? '無題の UI' : trimmed;
};

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
  const { code, meta, prompt } = value as Record<string, unknown>;
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
    ...(typeof prompt === 'string' ? { prompt } : {}),
  };
};

// projectId が null なら新規プロジェクト＋初版、そうでなければ版を追記。
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

// 最新版を複製して新プロジェクト（forkOf 付き・private）を作る。非所有なら null。
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
  // 所有者は selectProjectWithLatestVersion で確認済み。
  const versionRows = await selectProjectVersions({
    projectId: input.projectId,
  });
  const conversation = versionRows.flatMap((version): ConversationTurn[] => {
    const parsed = parseContent(version.content);
    return parsed === null
      ? []
      : [{ prompt: parsed.prompt ?? null, meta: parsed.meta }];
  });
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    code: content.code,
    meta: content.meta,
    versionId: row.versionId,
    conversation,
  };
};

// 所有者でなければ false。
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

// 認証なし。アセット配信の権威付け用。
export const isSlugPublic = (slug: string): Promise<boolean> =>
  selectIsSlugPublic(slug);

// 認証なし・公開ページ用。非公開や壊れた content は null。
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
