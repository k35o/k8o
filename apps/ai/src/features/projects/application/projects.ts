import 'server-only';
import { isNonEmptySpec } from '@json-render/core';
import type { Spec } from '@json-render/core';
import type { AiVisibility } from '@repo/database/schema';

import { toMeta } from '@/features/generation/application/parse-meta';
import type { GenerationMeta } from '@/features/generation/application/parse-meta';

import {
  projectOwnedBy,
  selectProjectWithLatestVersion,
  selectPublicProjectBySlug,
  updateProjectVisibility,
} from '../infrastructure/project-repository';
import type { ProjectListItem } from '../infrastructure/project-repository';
import { createProjectStore } from './project-store';
import type { ConversationTurn } from './project-store';

export type UiStudioContent = {
  spec: Spec;
  meta: GenerationMeta;
  // 初版/フォークでは prompt が無いことがある。
  prompt?: string;
};

export type LoadedProject = {
  id: number;
  title: string;
  slug: string;
  spec: Spec;
  meta: GenerationMeta;
  versionId: number;
  // 古い順の全ターン（チャット復元用）。
  conversation: ConversationTurn[];
};

export type PublicProject = {
  id: number;
  title: string;
  slug: string;
  spec: Spec;
  meta: GenerationMeta;
};

export type { ProjectListItem } from '../infrastructure/project-repository';

const parseContent = (value: unknown): UiStudioContent | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { spec, meta, prompt } = value as Record<string, unknown>;
  if (!isNonEmptySpec(spec)) {
    return null;
  }
  const parsedMeta = toMeta(meta);
  if (parsedMeta === null) {
    return null;
  }
  return {
    spec,
    meta: parsedMeta,
    ...(typeof prompt === 'string' ? { prompt } : {}),
  };
};

const store = createProjectStore<UiStudioContent>({
  app: 'ui-studio',
  fallbackTitle: '無題の UI',
  parseContent,
});

// projectId が null なら新規プロジェクト＋初版、そうでなければ版を追記。
export const saveGeneration = (input: {
  userId: string;
  projectId: number | null;
  parentVersionId: number | null;
  content: UiStudioContent;
}): Promise<{ projectId: number; versionId: number; title: string } | null> =>
  store.saveGeneration(input);

export const getProjectsForUser = (
  userId: string,
): Promise<ProjectListItem[]> => store.getProjectsForUser(userId);

// 最新版を複製して新プロジェクト（forkOf 付き・private）を作る。非所有なら null。
export const forkProject = (input: {
  userId: string;
  sourceProjectId: number;
}): Promise<{ projectId: number } | null> => store.forkProject(input);

// 公開/非公開の操作用の軽量版。会話履歴（全版）は読まない。
export const getProjectLatest = async (input: {
  userId: string;
  projectId: number;
}): Promise<{ slug: string; versionId: number } | null> => {
  const row = await selectProjectWithLatestVersion(input);
  return row === null ? null : { slug: row.slug, versionId: row.versionId };
};

export const getProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<LoadedProject | null> => {
  const record = await store.getProject(input);
  if (record === null) {
    return null;
  }
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    spec: record.content.spec,
    meta: record.content.meta,
    versionId: record.versionId,
    conversation: record.conversation,
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
    spec: content.spec,
    meta: content.meta,
  };
};
