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
  loadProjectAction,
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
  load: (projectId: number) => Promise<LoadedProject | null>;
  fork: (sourceProjectId: number) => Promise<number | null>;
  reset: () => void;
  refresh: () => Promise<void>;
};

// 履歴の保存/一覧/読込を担う。現在の projectId / version は ref で持ち、useChat の
// onFinish のような一度きりのクロージャから最新値を参照できるようにする（stale 回避）。
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

  const load = useCallback(
    async (id: number): Promise<LoadedProject | null> => {
      const project = await loadProjectAction(id);
      if (project === null) {
        return null;
      }
      setCurrent(project.id, project.versionId, project.title);
      return project;
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
    load,
    fork,
    reset,
    refresh,
  };
};
