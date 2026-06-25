'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { GenerationMeta } from '@/features/generation/application/parse-generation';
import type {
  LoadedProject,
  ProjectListItem,
} from '@/features/projects/application/projects';
import {
  forkProjectAction,
  listProjectsAction,
  saveGenerationAction,
} from '@/features/projects/interface/actions';

export type StudioPersistence = {
  projects: ProjectListItem[];
  projectId: number | null;
  projectTitle: string | null;
  currentVersionId: number | null;
  save: (content: {
    code: string;
    meta: GenerationMeta;
    prompt: string;
  }) => Promise<void>;
  // 既に読み込み済みのプロジェクトを現在の選択として確定する（再フェッチしない）。
  markLoaded: (project: LoadedProject) => void;
  fork: (sourceProjectId: number) => Promise<number | null>;
  reset: () => void;
  refresh: () => Promise<void>;
};

// projectId / version は ref で持ち、useChat の onFinish のような一度きりのクロージャから最新値を参照する（stale 回避）。
export const useStudioPersistence = (): StudioPersistence => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<number | null>(null);
  const projectIdRef = useRef<number | null>(null);
  const versionIdRef = useRef<number | null>(null);

  const setCurrent = useCallback(
    (id: number | null, versionId: number | null, title: string | null) => {
      projectIdRef.current = id;
      versionIdRef.current = versionId;
      setProjectId(id);
      setProjectTitle(title);
      setCurrentVersionId(versionId);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setProjects(await listProjectsAction());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (content: { code: string; meta: GenerationMeta; prompt: string }) => {
      const res = await saveGenerationAction({
        projectId: projectIdRef.current,
        parentVersionId: versionIdRef.current,
        code: content.code,
        meta: content.meta,
        prompt: content.prompt,
      });
      if (res === null) {
        return;
      }
      setCurrent(res.projectId, res.versionId, res.title);
      await refresh();
    },
    [refresh, setCurrent],
  );

  const markLoaded = useCallback(
    (project: LoadedProject): void => {
      setCurrent(project.id, project.versionId, project.title);
    },
    [setCurrent],
  );

  const fork = useCallback(
    async (sourceProjectId: number): Promise<number | null> => {
      const res = await forkProjectAction(sourceProjectId);
      if (res === null) {
        return null;
      }
      await refresh();
      return res.projectId;
    },
    [refresh],
  );

  const reset = useCallback(() => {
    setCurrent(null, null, null);
  }, [setCurrent]);

  return {
    projects,
    projectId,
    projectTitle,
    currentVersionId,
    save,
    markLoaded,
    fork,
    reset,
    refresh,
  };
};
