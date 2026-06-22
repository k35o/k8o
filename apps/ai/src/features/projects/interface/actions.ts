'use server';

import { headers } from 'next/headers';

import type { GenerationMeta } from '@/features/generation/application/parse-generation';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  getProject,
  getProjectsForUser,
  type LoadedProject,
  type ProjectListItem,
  saveGeneration,
} from '../application/projects';

// 生成結果を履歴として保存する。未許可は null（クライアントは保存失敗として無視）。
export const saveGenerationAction = async (input: {
  projectId: number | null;
  parentVersionId: number | null;
  code: string;
  meta: GenerationMeta;
}): Promise<{ projectId: number; versionId: number; title: string } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return saveGeneration({
    userId: session.userId,
    projectId: input.projectId,
    parentVersionId: input.parentVersionId,
    content: { code: input.code, meta: input.meta },
  });
};

export const listProjectsAction = async (): Promise<ProjectListItem[]> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  return getProjectsForUser(session.userId);
};

export const loadProjectAction = async (
  projectId: number,
): Promise<LoadedProject | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return getProject({ userId: session.userId, projectId });
};
