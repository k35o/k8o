'use server';

import { headers } from 'next/headers';

import type { GenerationMeta } from '@/features/generation/application/parse-generation';
import {
  type ApplyPreviewResult,
  applyStudioPreviewCode,
} from '@/features/preview/application/sandbox-runtime';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  forkProject,
  getProject,
  getProjectsForUser,
  type LoadedProject,
  type ProjectListItem,
  saveGeneration,
} from '../application/projects';
import {
  forkSlidesProject,
  getSlidesProject,
  getSlidesProjectsForUser,
  type LoadedSlidesProject,
  saveSlidesGeneration,
} from '../application/slides-projects';

export const saveGenerationAction = async (input: {
  projectId: number | null;
  parentVersionId: number | null;
  code: string;
  meta: GenerationMeta;
  prompt: string;
}): Promise<{ projectId: number; versionId: number; title: string } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return saveGeneration({
    userId: session.userId,
    projectId: input.projectId,
    parentVersionId: input.parentVersionId,
    content: { code: input.code, meta: input.meta, prompt: input.prompt },
  });
};

export const listProjectsAction = async (): Promise<ProjectListItem[]> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  return getProjectsForUser(session.userId);
};

// プロジェクト読込（DB）とプレビュー反映（Sandbox）を1往復・1回の認証にまとめる。
// 切り替えで load→apply を別々に呼ぶと、ブラウザ↔サーバー往復とセッション照会が2回ずつ
// 走って遅いため、ここで一括する。非所有/不存在は null。
export const loadProjectAndApplyAction = async (
  projectId: number,
): Promise<{ project: LoadedProject; applied: ApplyPreviewResult } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  const project = await getProject({ userId: session.userId, projectId });
  if (project === null) {
    return null;
  }
  const applied = await applyStudioPreviewCode(project.code);
  return { project, applied };
};

export const forkProjectAction = async (
  sourceProjectId: number,
): Promise<{ projectId: number } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return forkProject({ userId: session.userId, sourceProjectId });
};

export const saveSlidesGenerationAction = async (input: {
  projectId: number | null;
  parentVersionId: number | null;
  source: string;
  meta: GenerationMeta;
  prompt: string;
}): Promise<{ projectId: number; versionId: number; title: string } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return saveSlidesGeneration({
    userId: session.userId,
    projectId: input.projectId,
    parentVersionId: input.parentVersionId,
    content: { source: input.source, meta: input.meta, prompt: input.prompt },
  });
};

export const listSlidesProjectsAction = async (): Promise<
  ProjectListItem[]
> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  return getSlidesProjectsForUser(session.userId);
};

// スライドはホスト側でそのまま描画するため、ui-studio と違い Sandbox 反映は無い。非所有/不存在は null。
export const loadSlidesProjectAction = async (
  projectId: number,
): Promise<LoadedSlidesProject | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return getSlidesProject({ userId: session.userId, projectId });
};

export const forkSlidesProjectAction = async (
  sourceProjectId: number,
): Promise<{ projectId: number } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return forkSlidesProject({ userId: session.userId, sourceProjectId });
};
