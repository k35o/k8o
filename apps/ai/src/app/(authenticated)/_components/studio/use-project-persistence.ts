'use client';

import { useCallback, useRef, useState } from 'react';

import type { GenerationMeta } from '@/features/generation/application/parse-meta';
import type { ProjectListItem } from '@/features/projects/application/projects';

type SaveResult = {
  projectId: number;
  versionId: number;
  title: string;
} | null;

type PersistenceActions<TContent> = {
  list: () => Promise<ProjectListItem[]>;
  save: (
    input: TContent & {
      projectId: number | null;
      parentVersionId: number | null;
      meta: GenerationMeta;
      prompt: string;
    },
  ) => Promise<SaveResult>;
  fork: (sourceProjectId: number) => Promise<{ projectId: number } | null>;
};

export type ProjectPersistence<TContent> = {
  projects: ProjectListItem[];
  projectId: number | null;
  projectTitle: string | null;
  currentVersionId: number | null;
  save: (
    content: TContent & { meta: GenerationMeta; prompt: string },
  ) => Promise<void>;
  // 既に読み込み済みのプロジェクトを現在の選択として確定する（再フェッチしない）。
  markLoaded: (project: {
    id: number;
    versionId: number;
    title: string;
  }) => void;
  fork: (sourceProjectId: number) => Promise<number | null>;
  reset: () => void;
  refresh: () => Promise<void>;
};

// UI/スライド両スタジオ共通のプロジェクト永続化。サーバー側の createProjectStore と
// 同じ構図で、アプリ差分（呼ぶ action と保存 content の型）はパラメータで注入する。
// actions はモジュールスコープの定数を渡すこと。
// 一覧の初期値はページの Server Component で取得したものを受け取り、以後は refresh で更新する。
// projectId / version は ref で持ち、useChat の onFinish のような一度きりの
// クロージャから最新値を参照する（stale 回避）。
export const useProjectPersistence = <TContent>(
  actions: PersistenceActions<TContent>,
  initialProjects: ProjectListItem[],
): ProjectPersistence<TContent> => {
  const [projects, setProjects] = useState<ProjectListItem[]>(initialProjects);
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
    setProjects(await actions.list());
  }, [actions]);

  const save = useCallback(
    async (content: TContent & { meta: GenerationMeta; prompt: string }) => {
      const res = await actions.save({
        ...content,
        projectId: projectIdRef.current,
        parentVersionId: versionIdRef.current,
      });
      if (res === null) {
        return;
      }
      setCurrent(res.projectId, res.versionId, res.title);
      await refresh();
    },
    [actions, refresh, setCurrent],
  );

  const markLoaded = useCallback(
    (project: { id: number; versionId: number; title: string }): void => {
      setCurrent(project.id, project.versionId, project.title);
    },
    [setCurrent],
  );

  const fork = useCallback(
    async (sourceProjectId: number): Promise<number | null> => {
      const res = await actions.fork(sourceProjectId);
      if (res === null) {
        return null;
      }
      await refresh();
      return res.projectId;
    },
    [actions, refresh],
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
