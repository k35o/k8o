'use server';

import { headers } from 'next/headers';

import type { GenerationMeta } from '@/features/generation/application/parse-generation';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  forkProject,
  getProject,
  getProjectsForUser,
  type LoadedProject,
  type ProjectListItem,
  saveGeneration,
} from '../application/projects';

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

export const loadProjectAction = async (
  projectId: number,
): Promise<LoadedProject | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  return getProject({ userId: session.userId, projectId });
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
