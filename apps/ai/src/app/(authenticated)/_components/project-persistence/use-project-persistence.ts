'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

import type { GenerationMeta } from '@/features/generation/application/parse-meta';

type SaveResult = {
  projectId: number;
  versionId: number;
  title: string;
} | null;

type PersistenceActions<TContent> = {
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
  fork: (sourceProjectId: number) => Promise<void>;
  reset: () => void;
};

// 保存と fork は画面を離れたあとに返ることがあり、隠れたスタジオから URL を変えると
// 移った先の画面から連れ戻してしまうので、このスタジオの URL にいるときだけ変える。
const isOnStudio = (basePath: '/' | '/slides'): boolean =>
  window.location.pathname === basePath;

// UI/スライド両スタジオ共通のプロジェクト永続化。サーバー側の createProjectStore と
// 同じ構図で、アプリ差分（呼ぶ action と保存 content の型）はパラメータで注入する。
// actions はモジュールスコープの定数を渡すこと。
// projectId / version は ref で持ち、useChat の onFinish のような一度きりの
// クロージャから最新値を参照する（stale 回避）。
export const useProjectPersistence = <TContent>(
  actions: PersistenceActions<TContent>,
  basePath: '/' | '/slides',
): ProjectPersistence<TContent> => {
  const router = useRouter();
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

  const save = useCallback(
    async (content: TContent & { meta: GenerationMeta; prompt: string }) => {
      const wasNew = projectIdRef.current === null;
      const res = await actions.save({
        ...content,
        projectId: projectIdRef.current,
        parentVersionId: versionIdRef.current,
      });
      if (res === null) {
        return;
      }
      setCurrent(res.projectId, res.versionId, res.title);
      if (wasNew && isOnStudio(basePath)) {
        router.replace(`${basePath}?project=${res.projectId.toString()}`);
      }
    },
    [actions, basePath, router, setCurrent],
  );

  const markLoaded = useCallback(
    (project: { id: number; versionId: number; title: string }): void => {
      setCurrent(project.id, project.versionId, project.title);
    },
    [setCurrent],
  );

  const fork = useCallback(
    async (sourceProjectId: number): Promise<void> => {
      const res = await actions.fork(sourceProjectId);
      if (res === null || !isOnStudio(basePath)) {
        return;
      }
      router.push(`${basePath}?project=${res.projectId.toString()}`);
    },
    [actions, basePath, router],
  );

  const reset = useCallback(() => {
    setCurrent(null, null, null);
  }, [setCurrent]);

  return {
    projectId,
    projectTitle,
    currentVersionId,
    save,
    markLoaded,
    fork,
    reset,
  };
};
