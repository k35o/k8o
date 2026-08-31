'use server';

import { validateGeneratedSpec } from '@k8ordo/ui/json-render';
import { headers } from 'next/headers';

import { toMeta } from '@/features/generation/application/parse-meta';
import type { GenerationMeta } from '@/features/generation/application/parse-meta';
import { toSpec } from '@/features/generation/application/spec-message';
import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  forkProject,
  getProject,
  getProjectsForUser,
  saveGeneration,
} from '../application/projects';
import type { LoadedProject, ProjectListItem } from '../application/projects';
import {
  forkSlidesProject,
  getSlidesProject,
  getSlidesProjectsForUser,
  saveSlidesGeneration,
} from '../application/slides-projects';
import type { LoadedSlidesProject } from '../application/slides-projects';

export const saveGenerationAction = async (input: {
  projectId: number | null;
  parentVersionId: number | null;
  spec: unknown;
  meta: GenerationMeta;
  prompt: string;
}): Promise<{ projectId: number; versionId: number; title: string } | null> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return null;
  }
  // server action の引数は信頼しない。spec は catalog に対して検証し、meta も
  // 既知の形へ正規化してから保存する（クライアントで検証済みでも未検証として扱う）。
  const validated = validateGeneratedSpec(input.spec);
  const meta = toMeta(input.meta);
  if (!validated.ok || meta === null) {
    return null;
  }
  return saveGeneration({
    userId: session.userId,
    projectId: input.projectId,
    parentVersionId: input.parentVersionId,
    content: {
      spec: toSpec(validated.spec),
      meta,
      prompt: input.prompt,
    },
  });
};

export const listProjectsAction = async (): Promise<ProjectListItem[]> => {
  const session = await requireAllowedSession(await headers());
  if (session === null) {
    return [];
  }
  return getProjectsForUser(session.userId);
};

// 非所有/不存在は null。
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
  // ui 側の saveGenerationAction と同じく、境界では meta を正規化してから保存する。
  const meta = toMeta(input.meta);
  if (meta === null || input.source.trim() === '') {
    return null;
  }
  return saveSlidesGeneration({
    userId: session.userId,
    projectId: input.projectId,
    parentVersionId: input.parentVersionId,
    content: { source: input.source, meta, prompt: input.prompt },
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

// 非所有/不存在は null。
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
