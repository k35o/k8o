import 'server-only';
import {
  type GenerationMeta,
  toMeta,
} from '@/features/generation/application/parse-meta';

import type { ProjectListItem } from '../infrastructure/project-repository';
import { type ConversationTurn, createProjectStore } from './project-store';

export type SlidesContent = {
  // デッキ全体の Markdown ソース。
  source: string;
  meta: GenerationMeta;
  // 初版/フォークでは prompt が無いことがある。
  prompt?: string;
};

export type LoadedSlidesProject = {
  id: number;
  title: string;
  slug: string;
  source: string;
  meta: GenerationMeta;
  versionId: number;
  // 古い順の全ターン（チャット復元用）。
  conversation: ConversationTurn[];
};

const parseContent = (value: unknown): SlidesContent | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { source, meta, prompt } = value as Record<string, unknown>;
  if (typeof source !== 'string') {
    return null;
  }
  const parsedMeta = toMeta(meta);
  if (parsedMeta === null) {
    return null;
  }
  return {
    source,
    meta: parsedMeta,
    ...(typeof prompt === 'string' ? { prompt } : {}),
  };
};

const store = createProjectStore<SlidesContent>({
  app: 'slides',
  fallbackTitle: '無題のスライド',
  parseContent,
});

// projectId が null なら新規プロジェクト＋初版、そうでなければ版を追記。
export const saveSlidesGeneration = (input: {
  userId: string;
  projectId: number | null;
  parentVersionId: number | null;
  content: SlidesContent;
}): Promise<{ projectId: number; versionId: number; title: string } | null> =>
  store.saveGeneration(input);

export const getSlidesProjectsForUser = (
  userId: string,
): Promise<ProjectListItem[]> => store.getProjectsForUser(userId);

// 最新版を複製して新プロジェクト（forkOf 付き・private）を作る。非所有なら null。
export const forkSlidesProject = (input: {
  userId: string;
  sourceProjectId: number;
}): Promise<{ projectId: number } | null> => store.forkProject(input);

export const getSlidesProject = async (input: {
  userId: string;
  projectId: number;
}): Promise<LoadedSlidesProject | null> => {
  const record = await store.getProject(input);
  if (record === null) {
    return null;
  }
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    source: record.content.source,
    meta: record.content.meta,
    versionId: record.versionId,
    conversation: record.conversation,
  };
};
